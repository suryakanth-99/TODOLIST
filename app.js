
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _ = require("lodash");
const mongoose = require("mongoose")
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// var items =[];
// var collegework = [];
mongoose.set('useFindAndModify', false);

let date =new Date();
let options = { weekday : "long"}
const day = date.toLocaleDateString("en-US", options)
// console.log(day);

mongoose.connect(" mongodb://localhost:27017/todolistdb",  {useNewUrlParser: true, useUnifiedTopology: true});
const itemschema = {
    name : String
};
const Item = mongoose.model("Item", itemschema);
const item1 = new Item({
    name : "Wake at 6AM"
});
const item2 = new Item({
    name : "be ready by 8"
});
const item3 = new Item({
    name: "Go to college"
});
const listarray = [item1,item2,item3];


const Listschema = {
    Listname : String,
    items : [itemschema]
} 

const List = mongoose.model("List",Listschema);



app.get("/", function(req,res){
    Item.find({},function(err,listitem){
        if(listitem.length === 0){
            Item.insertMany(listarray, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("successfully inseerted 3 items");
                }
            });
            res.redirect("/");
            }
            else{
                res.render("list",{ listtitle : day , listitem:listitem}); 
                // console.log("hooo");
            
            }  
    });
});





app.get("/:customListName",function(req,res){
    //console.log("check");
    const customListName = _.capitalize(req.params.customListName);
    
        List.findOne({Listname : customListName},async function(err, result){
            if(!err){
                if(!result){
                    const list= new List({
                        Listname : customListName,
                        items : listarray
                    });
                    await list.save()
                    // console.log("other routes for first time accessing");
                    res.redirect("/" + customListName)
                }
                else{
                    res.render("list", {listtitle : result.Listname, listitem : result.items});
                    // console.log("rendering other routes");
                    
                }
            }
        });
    
    

});






app.post("/", function(req,res){
    const itemname = req.body.item1;
    // console.log(itemname);
    const listname= req.body.list;
    // console.log(listname);
    const data = new Item({name : itemname});

    if (listname === day){
        
        data.save()
        res.redirect("/");
    }
    else{
        List.findOne({Listname : listname},function(err, result){
            result.items.push(data);
            result.save();
            res.redirect("/" + listname);
        });


        
    }  
});

app.post("/delete", function(req,res){
    let removingelement = req.body.check;
    const listname= req.body.listname;
    if(listname === day){
        Item.findByIdAndRemove(removingelement, function(err){
        })
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({Listname : listname},{$pull: {items:{_id:removingelement}}},function(err,foundlist){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }
    // console.log(removingelement);
   
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}

app.listen(port, function(){
    console.log("server is running on port 3000");
});
