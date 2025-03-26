# Webapps DB Initialization

## Installation

The installation for this is a simple process. There are two steps to this process.

1. Take this snippet and put it in your .env file:

```conf
DATABASE_URL="mysql://<username>:<password>@<address>:3306/<database>"
```

2. Install the requirements.txt file: `pip install -r requirements.txt`

Once you've done these two things, you should be good to go.

## Execution

There are two separate scripts for data initialization. The first, and most important, is `main.py`. In `main.py` we pull all the department, major, and course information. This information is pulled directly from [Student Planning](https://selfservice.cedarville.edu/Student/Planning). Because we pull information from this authenticated endpoint, you will need to sign in with your Cedarville credentials in the automated browser window that opens. A streamlined description of the process is below:

1. Run `python main.py`
2. Log in with Cedarville credentials
3. Return to the console and press &lt;ENTER&gt;
4. Wait for the two scripts to finish executing
5. Press enter again to close the automated browser

The second part of this installation process is initializing the major requirements which we have retrieved from the current Academic Planning Environment. The process for this will change, but for now just grab IDs of the catalog that you would like to use and any majors you want to use. Run the program with `python ape.py` and enter the JSON file you would like to use. 