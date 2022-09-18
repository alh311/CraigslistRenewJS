# CraigslistRenewJS
This is a nodejs app for renewing your listings on Craigslist.  You can manually run the app whenever you want to renew your **renewable** listings.  This doesn't repost old, non-renewable listings.

## Usage Requirements
* You must have Node.js installed (https://nodejs.org)


## Setup
1. Navigate to, or open, the directory containing `bot.js` in your terminal app and run the command:
    ```
    $ npm install
    ```

2. Create a new, empty file named '`.env`' (not including the quotes) in the same directory as `bot.js`.

3. Paste the following in `.env`:

    ```
    EMAIL="<email>"
    PASSWORD="<password>"
    ```
4. Replace the values inside the angle brackets (`< >`) with your own Craigslist email and password.  Remove the brackets but not the quotes.  For example:

    ```
    EMAIL="bogusemail@gmail.com"
    PASSWORD="password1234"
    ```


## How to Use
1. Navigate to, or open, the directory containing `bot.js` in your terminal app.

2. Run the command:
    ```
    $ node bot.js
    ```

3. Follow on-screen instructions if there are any.
