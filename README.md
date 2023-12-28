# mongoLogImporter

## How to use 

Set the correct variables to connect with your mongoDB instance an db.

The script will look at the "ONLY_Monthly_Logs_Here" folder and push the 
content to the mongo db, every monthly folder will be set as new collection 
and all the hourly files will be read and every log will be imported as a
new document.

This is mean to be used with the logs produced by Betterstack and sent to a 
s3 long term instance, these files are in .zstd and needs to be decompressed.
Use this to work with .zstd files https://github.com/mcmilk/7-Zip-zstd
