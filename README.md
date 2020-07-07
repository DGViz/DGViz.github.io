## run program

cd <Program Directory>

```python app.py```

### requirements:

flask
flask_pymongo
pymongo

### database

mongod --dbpath <Program Directory/database>

mongoimport --db ehrdb --collection patient --type csv --drop --file ehr_demo.csv --headerline

