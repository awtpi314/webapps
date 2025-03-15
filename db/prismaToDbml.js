const fs = require('fs');

/**
 * Converts a Prisma schema file to DBML format
 * @param {string} prismaFilePath - Path to the Prisma schema file
 * @param {string} dbmlFilePath - Path where the DBML output should be saved
 */
function convertPrismaToDBML(prismaFilePath, dbmlFilePath) {
  try {
    // Read the Prisma schema file
    const prismaSchema = fs.readFileSync(prismaFilePath, 'utf8');
    
    // Parse and convert to DBML
    const dbmlContent = parsePrismaToDBML(prismaSchema);
    
    // Write the DBML content to file
    fs.writeFileSync(dbmlFilePath, dbmlContent);
    
    console.log(`Successfully converted ${prismaFilePath} to ${dbmlFilePath}`);
  } catch (error) {
    console.error('Error converting Prisma to DBML:', error.message);
  }
}

/**
 * Parses Prisma schema content and converts it to DBML format
 * @param {string} prismaContent - Prisma schema content
 * @returns {string} - DBML formatted content
 */
function parsePrismaToDBML(prismaContent) {
  let dbml = "// Database Markup Language (DBML) generated from Prisma schema\n\n";
  
  // Process models
  const models = [];
  const relations = [];
  
  // Remove comments and normalize newlines
  const cleanedContent = removeComments(prismaContent).replace(/\r\n/g, '\n');
  
  // Find all model blocks
  const modelRegex = /model\s+([A-Za-z0-9_]+)\s*{([^}]*)}/g;
  let modelMatch;
  
  while ((modelMatch = modelRegex.exec(cleanedContent)) !== null) {
    const modelName = modelMatch[1].trim();
    const modelBody = modelMatch[2].trim();
    
    let modelDefinition = `Table ${modelName} {\n`;
    const modelRelations = [];
    const indexes = [];
    
    // Process each line in the model body
    const lines = modelBody.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (trimmedLine === '') continue;
      
      // Process field definition
      const fieldMatch = trimmedLine.match(/([A-Za-z0-9_]+)\s+([^@]*)(.*)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1].trim();
        let fieldType = fieldMatch[2].trim();
        const attributes = fieldMatch[3] ? fieldMatch[3].trim() : '';
        
        // Skip relation fields entirely
        if (attributes.includes('@relation')) {
          // Extract relation information for later
          const relationMatch = attributes.match(/@relation\(([^)]*)\)/);
          if (relationMatch) {
            const relationAttrs = relationMatch[1];
            
            // Extract fields and references
            const fieldsMatch = relationAttrs.match(/fields:\s*\[\s*([^\]]+)\s*\]/);
            const refsMatch = relationAttrs.match(/references:\s*\[\s*([^\]]+)\s*\]/);
            
            if (fieldsMatch && refsMatch) {
              const fields = fieldsMatch[1].split(',').map(f => f.trim());
              const refs = refsMatch[1].split(',').map(r => r.trim());
              
              // Store relation info
              modelRelations.push({
                from: `${modelName}.${fields[0]}`,
                to: `${cleanTypeName(fieldType)}.${refs[0]}`,
                onDelete: 'cascade' // Default to cascade
              });
            }
          }
          
          // Skip adding this field to the model definition
          continue;
        } 
        
        // Handle array types
        const isArray = fieldType.endsWith('[]');
        if (isArray) {
          fieldType = fieldType.substring(0, fieldType.length - 2);
        }
        
        // Handle optional types
        const isOptional = fieldType.endsWith('?');
        if (isOptional) {
          fieldType = fieldType.substring(0, fieldType.length - 1);
        }
        
        // Map Prisma type to DBML type
        const dbmlType = mapPrismaTypeToDBML(fieldType);
        
        // Process field attributes
        let dbmlAttributes = [];
        
        // Is this a primary key?
        if (attributes.includes('@id')) {
          dbmlAttributes.push('pk');
        }
        
        // Is this auto-increment?
        if (attributes.includes('@default(autoincrement())')) {
          dbmlAttributes.push('increment');
        }
        
        // Is this unique?
        if (attributes.includes('@unique')) {
          dbmlAttributes.push('unique');
        }
        
        // Regular fields
        if (dbmlType) {
          modelDefinition += `  ${fieldName} ${dbmlType}`;
        }
        
        // Add attributes in brackets if there are any
        if (dbmlAttributes.length > 0) {
          modelDefinition += ` [${dbmlAttributes.join(', ')}]`;
        }
        
        modelDefinition += '\n';
      }
      // Handle composite indexes and other model-level attributes
      else if (trimmedLine.startsWith('@@')) {
        // Handle composite indexes
        if (trimmedLine.includes('@@index')) {
          const fieldsMatch = trimmedLine.match(/\[\s*([^\]]+)\s*\]/);
          
          if (fieldsMatch) {
            const indexFields = fieldsMatch[1].split(',').map(f => f.trim());
            const nameMatch = trimmedLine.match(/name:\s*"([^"]+)"/);
            const indexName = nameMatch ? nameMatch[1] : `${indexFields.join('_')}_idx`;
              
            indexes.push({
              fields: indexFields,
              name: indexName,
              type: 'index'
            });
          }
        }
        // Handle unique constraints
        else if (trimmedLine.includes('@@unique')) {
          const fieldsMatch = trimmedLine.match(/\[\s*([^\]]+)\s*\]/);
          
          if (fieldsMatch) {
            const indexFields = fieldsMatch[1].split(',').map(f => f.trim());
            const nameMatch = trimmedLine.match(/name:\s*"([^"]+)"/);
            const indexName = nameMatch ? nameMatch[1] : `${indexFields.join('_')}_unique`;
              
            indexes.push({
              fields: indexFields,
              name: indexName,
              type: 'unique'
            });
          }
        }
      }
    }
    
    // Add indexes section if needed
    if (indexes.length > 0) {
      modelDefinition += '\n  indexes {\n';
      indexes.forEach(idx => {
        if (idx.fields.length === 1) {
          modelDefinition += `    ${idx.fields[0]} [name: '${idx.name}']\n`;
        } else {
          modelDefinition += `    (${idx.fields.join(', ')}) [${idx.type}, name: '${idx.name}']\n`;
        }
      });
      modelDefinition += '  }\n';
    }
    
    modelDefinition += '}\n\n';
    models.push(modelDefinition);
    
    // Process relations for this model
    relations.push(...modelRelations);
  }
  
  // Add all model definitions to DBML
  dbml += models.join('');
  
  // Add relationships separately
  if (relations.length > 0) {
    relations.forEach(rel => {
      dbml += `Ref: ${rel.from} > ${rel.to} [delete: cascade]\n`;
    });
  }
  
  return dbml;
}

/**
 * Cleans type name by removing optional marker (?)
 * @param {string} typeName - Type name that might contain optional marker
 * @returns {string} - Clean type name without optional marker
 */
function cleanTypeName(typeName) {
  // Remove question mark if present
  return typeName.endsWith('?') ? typeName.substring(0, typeName.length - 1) : typeName;
}

/**
 * Maps Prisma data types to DBML data types
 * @param {string} prismaType - Prisma data type
 * @returns {string} - Equivalent DBML data type
 */
function mapPrismaTypeToDBML(prismaType) {
  const typeMap = {
    'String': 'Varchar(40)',
    'Int': 'Int',
    'BigInt': 'BigInt',
    'Float': 'Float',
    'Decimal': 'Decimal',
    'Boolean': 'Boolean',
    'DateTime': 'DateTime',
    'Date': 'Date',
    'Time': 'Time',
    'Json': 'Json',
    'Bytes': 'Binary',
    'Unsupported': 'Text'
  };
  
  return typeMap[prismaType];
}

/**
 * Removes comments from Prisma schema
 * @param {string} content - Prisma schema content
 * @returns {string} - Content without comments
 */
function removeComments(content) {
  // Remove single-line comments
  let noComments = content.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments
  noComments = noComments.replace(/\/\*[\s\S]*?\*\//g, '');
  
  return noComments;
}

// For CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node prisma-to-dbml.js <input-prisma-file> <output-dbml-file>');
    process.exit(1);
  }
  
  convertPrismaToDBML(args[0], args[1]);
}

module.exports = { convertPrismaToDBML };