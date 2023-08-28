//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
// import { getDate,getDay } from "./date.js";
// const date = require(__dirname + "/date.js");
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

app.set('view engine', 'ejs');//not necessary in new js version

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin_TJ:Thejus13@atlascluster.cmy6npq.mongodb.net/todolistDB");

const itemsSchema= new mongoose.Schema({
  name:String,
});

const Item= mongoose.model("item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your Todolist",
});

const item2 = new Item({
  name:"+ to add item",
});

const item3 = new Item({
  name:"Enter",
});

const listsSchema = {
  name: String,
  items:[itemsSchema],
};

const List=mongoose.model("list",listsSchema);


const todayItems = [item1,item2,item3];
// Item.insertMany(todayItems,function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully added the items");
//   }
// });




const workItems = [];

app.get("/", function(req, res) {
 
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
      
      Item.insertMany(todayItems).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }else{
    res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })

});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function (foundList) {
    if(foundList){
      // console.log("already exits");
      
      res.render("list", {listTitle: foundList.name , newListItems: foundList.items});

    }
    else{
      const list = new List({
        name : customListName,
        items:todayItems,
      });
    
      list.save();
      res.redirect("/"+customListName);
      // console.log("new list");

    }
  })



  // if(requested==="work")
  // res.render("list", {listTitle: "Work List", newListItems: item});

});


app.post("/", function(req, res){

  const item = req.body.newItem;
  const list=req.body.list;

  // if (req.body.list === "Work") {

  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
    const newitem = new Item({
      name:item,
    });

    if(list==="Today"){
      newitem.save()
      res.redirect("/");
    }else{
      List.findOne({name:list}).then(function(foundList) {
        foundList.items.push(newitem);
        foundList.save();
        res.redirect("/"+foundList.name);
      });
    }
    // .then(function () {
    //   console.log("Successfully added  to DB");
    // }).catch(function (err) {
    //   console.log(err);
    // });

    // items.push(item);
  // }
});

app.post("/delete",(req,res)=>{
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function (){
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(){
      res.redirect("/"+listName);
    }).catch(function (err) {
      console.log(err);
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
