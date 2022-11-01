const express = require("express");
const bodyParser = require("body-parser");
const { Router } = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");


const app = express();

// To use the EJB , Post-Request , Enabling CSS
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sharib:Test-123@cluster0.xenhzlg.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your Todolist! "
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

// const item3 = new Item({
//     name: "<-- Hit this to delete an item."
// });

const defaultItems = [item1, item2];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    var day = date();

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully save default items to DB!");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", { listTitle: day, newListItems: foundItems });
        }
    })
});


app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    })

}); 


app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    // if (listName === "day") {
        item.save();
        res.redirect("/"); 
    // }
    // else {
    //     List.findOne({name: listName}, function(err, foundList){
    //         foundList.items.push(item);
    //         foundList.save();
    //         res.redirect("/" + listName);
    //     })
    // }
});

app.post("/delete", function(req, res){
    const checkedItemsId = req.body.checkbox;
    const listName = req.body.listName;

    // if(listName === "day") {
        Item.findByIdAndRemove(checkedItemsId, function(err){
            if(err){
                console.log(err);
            }
            else {
                console.log("sucessfully Deleted");
            }
        });
        res.redirect("/")
    // }
    // else {
    //     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemsId}}}, function(err, foundItems){
    //         if(!err){
    //             res.redirect("/" + listName)
    //         }
    //     });
    // }
});



// This is for Work Route 


app.post("/work", function (req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started Successfully !");
});