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
  queryAllProducts();
  
});


function queryAllProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
    }
    console.log("-----------------------------------");
    start();
  });
}

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "customerInput",
      type: "list",
      message: "Would you like to buy anyting?",
      choices: ["Yes", "No"]
    })
    .then(function(answer) {
      if (answer.customerInput === "Yes") {
        buyProducts();
      }
       else{
        connection.end();
      }
    });
}


function buyProducts() {
  // query the database for all items
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
          message: "What item would you like to buy?"
        },
        {
          name: "Amount",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }

    
        if (chosenItem.stock_quantity > parseInt(answer.Amount)) {

          var newAmount = chosenItem.stock_quantity - answer.Amount;
          var newPirce = chosenItem.price * answer.Amount;
       
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
              console.log("Thank you for purchasing " + answer.Amount + " " + answer.choice + " for the Amount of $" + newPirce + "!" );
              console.log("-----------------------------------");
              start();
            }
          );
        }
        else {
          // not enough quantity
          console.log("Insufficient quantity!");
          start();
        }
      });
  });
}
