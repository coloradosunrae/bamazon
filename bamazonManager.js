var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "Znf,ni7s",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});


// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "managerDec",
      type: "list",
      message: "What would you like to do today",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "EXIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.managerDec === "View Products for Sale") {
        queryAllProducts();
      }
      else if(answer.managerDec === "View Low Inventory") {
        lowinventory();
      } else if(answer.managerDec === "Add to Inventory") {
        addInventory();
      } else if(answer.managerDec === "Add New Product") {
        addProducts();
      } 
      else{
        connection.end();
      }
    });
}

function queryAllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
      for (var i = 0; i < res.length; i++) {
        console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
      }
      console.log("-----------------------------------");
      console.log("Thank you Manger... Anything Else?");
      start();
    });
  }

  function lowinventory() {
    connection.query("SELECT * FROM bamazon.products WHERE stock_quantity < 5", function(err, res) {
      for (var i = 0; i < res.length; i++) {
        console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
      }
      console.log("-----------------------------------");
      console.log("Thank you Manger... Anything Else?");
      start();
    });
  }
  
function addProducts() {
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What is the item you would like to submit?"
      },
      {
        name: "department",
        type: "input",
        message: "What Department would you like to submit in?"
      },
      {
        name: "stock",
        type: "input",
        message: "What is the amount of Product??"
      },
      {
        name: "price",
        type: "input",
        message: "What is the Price of the Product?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.item,
          department_name: answer.department,
          price: answer.price || 0,
          stock_quantity: answer.stock
        },
        function(err) {
          if (err) throw err;
          console.log("Your new item was successfully added!");
          console.log(answer.item + " | " + answer.department+ " | " + answer.price + " | " + answer.stock);
          start();
        }
      );
    });
}

function addInventory() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "What item would you like to add to Inventory?"
        },
        {
          name: "Amount",
          type: "input",
          message: "How many are you adding?"
        }
      ])
      .then(function(answer) {
        var chosenItem;

        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }


        

          var newAmount = chosenItem.stock_quantity + parseInt(answer.Amount);


          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newAmount
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("You have added: " + answer.Amount + " " + answer.choice + " -  You know have: " +  newAmount);
              start();
            }
          );
        
      });
  });
}