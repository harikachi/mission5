#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import inquirer from 'inquirer';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection URL
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Function to insert a single order
async function insertRecord(database, collectionName, document) {
  try {
    await client.connect();
    const db = client.db(database);
    const collection = db.collection(collectionName);
    console.log('Inserting document:', document);
    const result = await collection.insertOne(document);
    console.log('Inserted document with _id:', result.insertedId);
  } catch (err) {
    console.error('Error inserting record:', err);
  } finally {
    await client.close();
  }
}

// Function to delete a single order
async function deleteRecord(database, collectionName, inputQuery) {
  try {
    await client.connect();
    const db = client.db(database);
    const collection = db.collection(collectionName);
    if(inputQuery == '') {
      console.log('Title is required to delete a document.');
    } else {
      const query = { title: inputQuery };
      const result = await collection.deleteOne(query);
      if (result.deletedCount > 0) {
        console.log('Deleted document:', result.deletedCount);
      } else {
        console.log('No document found to delete.');
      }
    }
  } catch (err) {
    console.error('Error deleting record:', err);
  } finally {
    await client.close();
  }
}

// Find or List orders function
async function findOrListOrders(database, collection, inputQuery) {
  try {
    await connectToDB();
    const db = client.db(database);
    const collectionHandle = db.collection(collection);
    if(inputQuery == '') { 
      const orders = await collectionHandle.find({}).toArray();
      console.log('All Orders from collection:', orders);
    } else {
      const query = { title: inputQuery };
      const order = await collectionHandle.findOne(query);
      console.log('Order from collection:', order);  
    }
  } catch (err) {
    console.error('Error reading data:', err);
  } finally {
    await client.close();
  }
}

// Seed orders function
async function seedAllData(database, collection, file) {
  try {
    await connectToDB();
    const db = client.db(database);
    const collectionHandle = db.collection(collection);

    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const result = await collectionHandle.insertMany(data);
    console.log(`Successfully inserted ${result.insertedCount} documents.`);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.close();
  }
}

// Delete orders function
async function deleteAllData(database, collection) {
  try {
    await connectToDB();
    const db = client.db(database);
    const collectionHandle = db.collection(collection);

    const result = await collectionHandle.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} documents.`);
  } catch (err) {
    console.error('Error deleting data:', err);
  } finally {
    await client.close();
  }
}

// Interactive prompt function
async function promptUser() {
  const questions = [
    {
      type: 'list',
      name: 'operation',
      message: 'What would you like to do?',
      choices: ['Insert Single Document', 'Find A Document', 'Delete Single Document', 'List Documents', 'Seed Documents', 'Delete All Documents']
    },
    {
      type: 'input',
      name: 'database',
      message: 'Enter the name of the database:',
      validate: (input) => input ? true : 'Database name is required!'
    },
    {
      type: 'input',
      name: 'collection',
      message: 'Enter the name of the collection:',
      validate: (input) => input ? true : 'Collection name is required!'
    },
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the order:',      
      when: (answers) => answers.operation === 'Insert Single Document',
      validate: (input) => {
        if(!input) {
        return 'Title is required!';
        } else {
          return true;
        }
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter the description of the order:',
      when: (answers) => answers.operation === 'Insert Single Document',
      validate: (input) => {
        if(!input) {
        return 'Description is required!';
        } else  {
          return true;
        }
      }
    },
    {
      type: 'input',
      name: 'start_price',
      message: 'Enter the start price of the order:',
      when: (answers) => answers.operation === 'Insert Single Document',
      validate: (input) => {
        if(!input) {
        return 'Start price is required!';
        } else  {
          return true;
        }
      }
    },
    {
      type: 'input',
      name: 'reserve_price',
      message: 'Enter the reserve price of the order:',
      when: (answers) => answers.operation === 'Insert Single Document',
      validate: (input) => {
        if(!input) {
        return 'Reserve price is required!';
        } else  {
          return true;
        }
      }
    },            
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the order to Search:',      
      when: (answers) => answers.operation === 'Find A Document',
      validate: (input) => {
        if(!input) {
        return 'Title is required!';
        } else  {
        return true;
        }
      }
    },
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the order to Delete:',      
      when: (answers) => answers.operation === 'Delete Single Document',
      validate: (input) => {
        if(!input) {
        return 'Title is required!';
        } else  {
        return true;
        }
      }
    },
    {
      type: 'message',
      name: 'title',
      message: 'List the order items from MongoDB:',
      when: (answers) => answers.operation === 'List Documents',
        default: true
    },
    {
      type: 'input',
      name: 'file',
      message: 'Enter the path to the JSON file:',
      when: (answers) => answers.operation === 'Seed Documents',
      validate: (input) => {
        if (!fs.existsSync(input)) {
          return 'File does not exist!';
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'confirmDelete',
      message: 'Are you sure you want to delete all data from this collection?',
      when: (answers) => answers.operation === 'Delete All Documents',
      default: false
    }
  ];

  const answers = await inquirer.prompt(questions);
  const document = {};

  if (answers.operation === 'Insert Single Document') {
    const document = { 
      title: answers.title,
      description: answers.description,
      start_price: answers.start_price,
      reserve_price: answers.reserve_price
    }
    await insertRecord(answers.database, answers.collection, document);
  } else if (answers.operation === 'Seed Documents' && answers.file) {
    await seedAllData(answers.database, answers.collection, answers.file);
  } else if (answers.operation === 'Find A Document') {
    await findOrListOrders(answers.database, answers.collection, answers.title);
  } else if (answers.operation === 'List Documents') {
    await findOrListOrders(answers.database, answers.collection, "");
  } else if (answers.operation === 'Delete Single Document') {
    await deleteRecord(answers.database, answers.collection, answers.title);
  } else if (answers.operation === 'Delete All Documents' && answers.confirmDelete) {
    await deleteAllData(answers.database, answers.collection);
  } else {
    console.log('Delete operation canceled.');
  }
}

// Run the interactive prompt
promptUser();
