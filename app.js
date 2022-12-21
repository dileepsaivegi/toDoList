const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _=require("lodash");
const url = "mongodb+srv://dileepsaivegi:Y49zRWGZUJVy3p9@cluster0.lr5g4.mongodb.net/toDoListDB?retryWrites=true&w=majority";
mongoose.set('strictQuery', true);
app.use(express.static("public"));

app.set("view engine", "ejs");
mongoose.connect(url);
mongoose.connection;


const Schema = mongoose.Schema;

//Schemas for items and ListNames
const itemsSchema = new Schema({
  name: String
});

const listSchema = new Schema({
  name: String,
  listItems: [itemsSchema]
});

//Model of the items
const Item = new mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the toDoList"
});
const item2 = new Item({
  name: "click + to add a new Item"
});
const item3 = new Item({
  name: "--> Select there to delete Item"
});

const defaultArray = [item1, item2, item3];



//Model of the ListNames
const ListNames = mongoose.model("listName", listSchema);
//Ignoring the favicon in the database
app.get('/favicon.ico', (req, res) => res.status(204).end);


//Creating the lists based upon their parameter
app.get("/:workItem", (req, res) => {
  const urlTitle = _.lodash(req.params.workItem);
  ListNames.findOne({
    name: urlTitle
  }, function(err, foundItems) {
    if (!err) 
    {
      if (!foundItems) {
        const TitleNames = new ListNames({
          name: urlTitle,
          listItems: defaultArray
        });
        TitleNames.save();
        res.redirect("/" + urlTitle);
      } else {
        res.render("list", {
          keyDay: foundItems.name,
          keyItem: foundItems.listItems
        });
      }
    }
  });
});

//Getting the default list items
app.get("/", function(req, res) {
  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("default values inserted");
        }
      });
      res.redirect("/");
    } else {
      items.forEach(function(items) {
        res.render("list", {
        keyDay: "today",
        keyItem: items
      });
      
      });
    }
  });
});


//Deleting the items from their respective lists

app.post("/delete", function(req, res) {
  const deleteItem = req.body.checkboxed;
  const deleteRouteItem = req.body.hiddenValue;
  if (deleteRouteItem === "today") {
    Item.findByIdAndRemove(deleteItem, function(err) {
      if (!err) { 
    ListNames.findOneAndUpdate({
      name: deleteRouteItem
    }, {
      $pull: {
        listItems: {
          _id: deleteItem
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + deleteRouteItem);
      }
    });
  }
});


//Inputing the items to thier respective lists using post request
app.post("/", function(req, res) {
  const nextItem = req.body.item;
  const buttonValue = req.body.buttonName;
  const itemNext = new Item({
    name: nextItem
  });
  if (buttonValue === "today") {
    itemNext.save();
    res.redirect("/");
  } else {
    ListNames.findOne({
      name: buttonValue
    }, function(err, foundList) {

      foundList.listItems.push(itemNext);
      foundList.save();
      res.redirect("/" + buttonValue);
    });
  }
});
