import express from "express";
import session from "express-session";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import jwt from "jsonwebtoken";


//express setup
let app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors({
  origin: "*"
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use(session({
  secret: '#@LLoWeeN#@LLoWeeN!',
  resave: false,
  saveUninitialized: true
}));


//jwt setup - set secret key for token verification
let secret = "@LLR0@DSLe@DT0R0Me088!";


let database = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '$PicyPatriot004!',
  database: 'gameDB'
})

database.connect((error) => {
  if (error) {
    console.log("error");
    throw error;
  }
  console.log("connected to gameDB");
})


//triggers on new user sign up to create a new entry in users table
function createNewUser(email, pass, username, phoneNum) {

  //create new hash for provided password
  bcrypt.hash(pass, 10, (err, hash) => {

    if (err) {
      console.log("hashing error" + err)
      return createResponse(204, false, "Password hashing Error");
    };

    //call add_user procedure, passing provided email, new hash, and provided phone number
    let sql = `Call add_user(?, ?, ?, 'EN');`;
    let parameters = [email, hash, phoneNum];

    database.query(sql, parameters, (error, result) => {
      if (error) {
        console.log("add_user error" + error);
        return createResponse(201, false, "Query Error");
      };

      //pull user database entry if successfully created
      let sql = "SELECT * from users where email_address = ?";
      let parameters = [email]
      database.query(sql, parameters, (error, result) => {
        console.log(result);
        if (error) {
          console.log("add_player error" + error);
          return createResponse(201, false, "Query Error");
        };

        try {
          //create player based on retrieved user_id and provided username
          if (result) {
            let response = createNewPlayer(result[0].user_id, username);
            return response;
          } else {
            console.log("no records");
            return createResponse(202, false, "No User Record found");
          };
        } catch (error) {
          console.log("result reading error " + error);
          return createResponse(205, false, "Result not found");
        };
      })

    })
  })
};

//trigger inside of createNewUser()?
function createNewPlayer(userID, newUsername) {
  let sql = `Call add_player(?, ?, 1000.00);`;
  let parameters = [userID, newUsername];
  database.query(sql, parameters, (error, results) => {
    if (error) {
      console.log("add_player error" + error);
      return createResponse(201, false, "Query Error");
    }
    console.log(results);
    return createResponse(200, true, null);
  })
};

function checkTextInput(value) {

  try {

    let words = value.split(" ");
    if (words.length > 1 || words[0] === "0" || words[0] === "1") {
      return false;
    };

    return true;

  } catch (error) {
    return false;
  }
}


function createResponse(code, content, err) {
  return {
    status: code,
    data: content,
    error: err
  };
};

app.post("/verifyUser", (req, res) => {

  let providedEmail;
  let providedPass;
  res.type('application/json'); //set response header content-type: 'application/json'

  try {
    providedEmail = req.body.emailAddress;
    providedPass = req.body.password;

    let sql = `Call find_user(?);`; //call stored procedure to find user in database
    let parameters = [providedEmail]; //set list of procedure parameters [(email: string)]
    console.log("query email parameter: " + parameters[0])
    database.query(sql, parameters, (err, results, fields)=>{

      if (err) {
        console.log("find_user error" + err);
        res.json(createResponse(201, false, "User search error"));
        return;
      }

      console.log("query sent")
      console.log(results);

      //if there is at least one row pulled from the database...
      if (results[0].length >= 1) {
        bcrypt.compare(providedPass, results[0][0].password_hash, (error, match) => { //...compare entered password to database hash
          if (match) { //if the password matches...
            console.log("matched");
            let user = {
              id: results[0][0].user_id,
              email: providedEmail,
              phoneNum: results[0][0].phone_number,
              language: results[0][0].language
            }
            
            let token = jwt.sign(user, secret, {
              expiresIn: 120
            }); //create a session token with jwt

            console.log("Token: " + token);
            let payload = {
              match: true,
              token: token
            }

            req.session.user = results[0][0].user_id;
            console.log("session user: " + req.session.user);
            res.json(createResponse(200, payload, null)); //send the token along with success code

          } else {
            console.log("not matched");
            res.json(createResponse(201, false, "password does not match")); //return custom error code and message
          };
        });

      } else { //if no rows are pulled from database
        console.log("no results")
        res.json(createResponse(202, false, "no records found"));
      };
    });

  } catch (error) {//if there is an issue with the query/validation
    console.log("verification error")
    console.log(error);
    res.json(createResponse(203, false, "could not perform query"));
  }
})




app.get("/verifyToken", (req, res) => {
  let storedToken;
  res.type('application/json');

  try {
    let storedToken = req.get('Authorization');
    let decodedJWT = jwt.verify(storedToken, secret);
    console.log("token verified");
    res.json(createResponse(200, true, null));
    return

  } catch (error) {
    console.log("Token: " + req.get('Authorization') + "\n Error: " + error);
    res.json(createResponse(400, false, "Invalid token"));
    return
  };

})



//route for getting user data from database and returning appropriate data type
app.post("/getPlayer", (req, res) => {
  //provided user ID
  let providedID;

  try {
    providedID = req.body.userID;
    let sql = "Call find_player_by_user(?)";
    let parameters = [providedID]
    database.query(sql, parameters, (error, results, fields) => {

      if (error) {
        console.log("get player error: " + error);
        res.json(createResponse(201, false, error));
        return;
      }

      if (results[0].length >= 1) {

        if (!results[0][0].suspended) {

          let playerData = {
            playerID: results[0][0].player_id,
            username: results[0][0].username,
            currentBalance: results[0][0].current_balance
          };

        res.json(createResponse(200, playerData, null));

        } else {
          res.json(createResponse(204, false,"user is suspended"))
          return;
        }

      } else {
        res.json(createResponse(202, false, "no records found"));
        return
      }
    })


  } catch (error) {
    console.log("Something went wrong with the POST request");
    console.log(error);
    res.json(createResponse(203, false, "could not perform query"));
    return
  };
});



//route for getting guild data from database
app.post("/getGuild", (req, res) => {
  
  console.log("user " + req.session.user);

  try {
      //stored procedure to return matched guild data 
      let sql = "Call find_guild(?);";
      console.log("sending id: " + req.body.playerID);
      let parameters = [req.body.playerID];
      database.query(sql, parameters, (error, results) => {
        if (error) {

          console.log("find guild error" + error);
          res.json(createResponse(203, false, ""+error));

        } else {
          console.log("1")
          console.log(results);
          try {
            let guildData = {
              guildID: results[0][0].guild_id,
              guildName: results[0][0].guild_name,
              guildGreeting: results[0][0].greeting
            };
            //res.json(createResponse(200, guildData, null));
            let sql2 = "Call find_leader(?)";
            let parameters2 = [guildData.guildID];
            database.query(sql2, parameters2, (error2, results2) => {
              if (error2) {
                res.json(createResponse(201, false, "Leader Search Error: " + error))
              }
              console.log("2")
              console.log(results2);
              try {
                let leaderData = {
                  playerID: results2[0][0].player_id,
                  username: results2[0][0].username
                };
                console.log("3")
                console.log(leaderData);
                let allData = {
                  guild: guildData,
                  leader: leaderData
                }
                console.log(4);
                console.log(allData);
                res.json(createResponse(200, allData, null));
              } catch (error) {
                res.json(createResponse(202, false, "Leader Results error: " + error));
              }
            })

          } catch (error) {

            console.log("no guilds found" + error);
            res.json(createResponse(202, false, "no guilds found"))
          }
      
        }
  })

  } catch (error) {
    console.log("query process error" + error);
    res.json(createResponse(203, false, "Query Process Error"));
  }

});



app.post("/createGuild", (req, res) => {
  try {
    let sql = "Call add_guild(?, ?, ?, ?)";
    let parameters = [req.body.playerID, req.body.guildName, req.body.welcomeMessage, req.body.greeting];
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("add guild error: " + error);
        res.json(createResponse(203, false, "" + error));
      };
      console.log("yes, I am!")
      res.json(createResponse(200, true, null));
    });
  } catch (error) {
    console.log("query error: " + error);
    res.json(createResponse(203, false, "query process error: " + error));
  }
});




//route for getting the usernames of guild members (including leader)
app.post("/getMembers", (req, res) => {

  try {

    let sql = "Call find_member_names(?)";
    let parameters = [req.body.playerID]
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("query error " + error);
      };

      if (results[0].length >= 1) {
        let memberNames = [];
        for (let i=0; i<results[0].length; i++) {
          memberNames.push(results[0][i].username);
        };
        res.json(createResponse(200, memberNames, null));
      } else {
        res.json(createResponse(200, [], null));
      }
    });

  } catch (error) {

    console.log("query error " + error);
    res.json(createResponse(203, false, "Query Error"));

  };

});


//route for searching existing guilds based on search string
app.post("/searchGuilds", (req, res) => {

  try {
    let sql = "Call new_search_guilds(?, ?)";
    let parameters = [req.body.playerID, req.body.searchTerm];
    database.query(sql, parameters, (error, results) => {

      if (error) {
        console.log("search_guild error: " + error);
        res.json(createResponse(203, false, "Guild Search Error"));
      };

      try {
        let guildList = [];
        for (let i = 0; i < results[0].length; i++) {
          let currGuild = {
            guildID: results[0][i].guild_id,
            guildName: results[0][i].guild_name,
            welcomeMessage: results[0][i].welcome_message,
            memberCount: results[0][i].members
          }
          guildList.push(currGuild);
        };
        console.log("Guild Search Successful");
        console.log("Search result: " + guildList);
        res.json(createResponse(200, guildList, null));
      } catch (error) {
        console.log("no records");
        res.json(createResponse(200, [], null));
      };

    })
  } catch (error) {
    console.log("query process error" + error);
    res.json(createResponse(203, false, "Query Process Error"));
  }

})

app.post("/addMessage", (req, res) => {
  try {
    let sql = "Call add_message(?, ?)";
    let parameters = [req.body.playerID, req.body.messageContent]
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Query error: " + error);
        res.json(createResponse(201, false, "Query Error: " + error))
        return;
      }

      console.log(results);
      try {
        res.json(createResponse(200, true, null));
      } catch (error) {
        res.json(createResponse(202, false, "Result Processing Error " + error));
        return;
      }
    })

  } catch (error) {
    res.json(createResponse(203, false, "Query Process Error: " + error));
    return;
  }
});

app.post("/getMessages", (req, res) => {

  try {
    let sql = "Call find_messages(?)";
    let parameters = [req.body.playerID];
    database.query(sql, parameters, (error, results) => {

      if (error) {
        console.log("find_messages query error: " + error);
        res.json(createResponse(201, false, "Get Message Query Error: " + error));
        return;
      };
      console.log(results);

      try {
        let messageData = [];
        for (let i = 0; i < results[0].length; i++) {
          messageData.push({
            username: results[0][i].username,
            messageContent: results[0][i].message_content,
            dateCreated: results[0][i].date_created
          })
        }
        console.log(messageData[0]);
        res.json(createResponse(200, messageData, null));

      } catch (error) {

        console.log("find_messages processing error: " + error);
        res.json(createResponse(202, false, "Get Message Result Processing Error: " + error))
        return;
      }
    })
  } catch (error) {
    console.log("find_message querying error: " + error);
    res.json(createResponse(203, false, "Find Message Query Process Error"))
    return;
  }
})


//route for updating database with new user/player
app.post("/addUser", (req, res) => {
  //express call to update database - pass user data in request body
  let newEmail = req.body.email
  let newPass = req.body.password
  let newUsername = req.body.username
  let newPhone = req.body.phoneNum

  //returns a createResponse object to send
  console.log("create new user response: ");
  //console.log(response);
  res.json(createNewUser(newEmail, newPass, newUsername, newPhone));
 
});


//route for adding a player to a guild
app.post("/addMember", (req, res) => {
  //express call to update guild record
  try {
    let sql = "Call add_member(?, ?)";
    let parameters = [req.body.playerID, req.body.guildID];

    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Error: " + error)
        res.json(createResponse(201, false, "add_member Query Error"));
        return;
      };

      res.json(createResponse(200, true, null))

    })

  } catch (error) {
    console.log(error);
    res.json(createResponse(203, false, "Query processing error: " + error));
    return;
  };
});

//route for removing a player from a guild
app.post("/deleteMember", (req, res) => {
  //express call to update guild record using passed ID to find user
  try {
    let sql = "Call delete_member(?)";
    let parameters = [req.body.playerID];

    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Error: " + error)
        res.json(createResponse(201, false, "delete_member Query Error"));
        return;
      };

      res.json(createResponse(200, true, null));

    })

  } catch (error) {
    console.log("Query Processing Error" + error);
    res.json(createResponse(203, false, "Query processing error: " + error));
    return;
  };
});

app.post("/getRequest", (req, res) => {

  try {
    let sql = "Call find_request_by_player(?)"
    let parameters = [req.body.playerID];
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Find Request Error");
        res.json(createResponse(201, false, "find_request Error"));
        return;
      };

      console.log("Find Request Result");
      console.log(results);
      try {
        let requestData = {
          guildID: results[0][0].guild_id,
          guildName: results[0][0].guild_name,
          welcomeMessage: results[0][0].welcome_message,
          dateCreated: results[0][0].date_created
        };
        res.json(createResponse(200, requestData, null));

      } catch (error) {
        console.log("find_request Processing Error: " + error);
        res.json(createResponse(202, false, "Result Processing Error"));
        return;
      }
    })
  } catch (error) {
    console.log("Query processing error: " + error);
    res.json(createResponse(203, false, "Query Processing Error"));
    return;
  }
});

app.post("/getAllRequests", (req, res) => {
  try {
    let sql = "Call find_requests(?)"
    let parameters = [req.body.playerID];
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Find Request Error");
        res.json(createResponse(201, false, "find_request Error"));
        return;
      };

      console.log("Find Request Result");
      console.log(results);
      try {
        console.log(results[0])
        let requestData = [];

        for (let i = 0; i < results[0].length; i++) {
          let request = {
            playerID: results[0][i].player_id,
            username: results[0][i].username,
            dateCreated: results[0][i].date_created
          };
          requestData.push(request);
        };

        res.json(createResponse(200, requestData, null));

      } catch (error) {
        console.log("find_request Processing Error: " + error);
        res.json(createResponse(202, false, "Result Processing Error"));
        return;
      }
    })
  } catch (error) {
    console.log("Query processing error: " + error);
    res.json(createResponse(203, false, "Query Processing Error"));
    return;
  }
})

app.post("/addRequest", (req, res) => {

  try {
    let sql = "Call add_request(?, ?)";
    let parameters = [req.body.guildID, req.body.playerID];

    database.query(sql, parameters, (error, results) => {

      if (error) {
        console.log("add_request Query Error: " + error);
        res.json(createResponse(201, false, "Add Request Error"));
        return;
      };

      res.json(createResponse(200, true, null));

    })

  } catch (error) {
    console.log("Add Request Processing Error" + error);
    res.json(createResponse(203, false, "Add Request Processing Error"));
    return;
  };

})

app.post("/rejectRequest", (req, res) => {

  try {
    let sql = "Call update_request(?, ?, ?)";
    let parameters = [req.body.guildID, req.body.playerID, "rejected"];

    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Error: " + error)
        res.json(createResponse(201, false, "reject_request Query Error"));
        return;
      };

      res.json(createResponse(200, true, null));

    });

  } catch (error) {
    console.log(error);
    res.json(createResponse(203, false, "Query processing error: " + error));
    return;
  };
})

app.post("/deleteRequest", (req, res) => {

  try {
    let sql = "Call delete_request(?, ?)";
    let parameters = [req.body.playerID, req.body.guildID];

    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Error: " + error)
        res.json(createResponse(201, false, "delete_request Query Error"));
        return;
      };

      res.json(createResponse(200, true, null));

    })

  } catch (error) {
    console.log(error);
    res.json(createResponse(203, false, "Query processing error: " + error));
    return;
  };
})


app.post("/deleteGuild", (req, res) => {

  try {
    let sql = "Call delete_guild(?)";
    let parameters = [req.body.guildID];

    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Error: " + error)
        res.json(createResponse(201, false, "delete_guild Query Error"));
        return;
      };

      res.json(createResponse(200, true, null));

    })

  } catch (error) {

    console.log(error);
    res.json(createResponse(203, false, "delete_guild Query processing error: " + error));
    return;
  };

});

app.get("/getStock", (req, res) => {

  try {
    let sql = "Call find_items()";
    database.query(sql, (error, results) => {

      if (error) {
        console.log("find_stock Error: " + error);
        res.json(createResponse(201, false, "Find Stock Error"));
        return;
      };

      try {

        let stock = [];
        for (let i = 0; i < results[0].length; i++) {
          let item = {
            itemID: results[0][i].item_id,
            itemName: results[0][i].item_name,
            itemType: results[0][i].item_type,
            itemDesc: results[0][i].item_description,
            itemPrice: results[0][i].item_price,
            imgLink: results[0][i].image_link
          }
          stock.push(item);
        };
        res.json(createResponse(200, stock, null));

      } catch (error) {
        console.log("Find Stock Result Processing Error: " + error);
        res.json(createResponse(202, false, "Find Stock Result Processing Error"));
        return;
      }

    })

  } catch (error) {
    console.log("getStock processing error: " + error);
    res.json(createResponse(203, false, "getStock Error"));
    return;
  };

})

app.post("/submitOrder", (req, res) => {

  try {
    //use add_transaction procedure to create a new transaction associated with the current player
    let sql = "Call add_transaction(?)";
    let parameters = [req.body.playerID];
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("add_transaction error: " + error);
        res.json(createResponse(201, false, "Add Transaction Error"))
      };

      try {
        //if the transaction was successully created in the db,
        //create a new order with the appropriate item and quantity associated with the appropriate transaction
        let sql2 = "Call add_order(?, ?, ?)";
        let parameters2 = [results[0][0].transaction_id, req.body.itemID, req.body.quantity];
        database.query(sql2, parameters2, (orderError, orderResults) => {
          if (orderError) {
            console.log("add_order error: " + orderError);
            res.json(createResponse(201, false, "Add Order error"));
          };

          let sql3 = "Call find_inventory(?)";
          let parameters3 = [req.body.playerID];
          database.query(sql3, parameters3, (playerError, playerResults) => {
            if (playerError) {
              console.log("find_inventory error: " + playerError);
              res.json(createResponse(201, false, "Find Inventory error"))
            };

            let sql4 = "Call update_inventory(?, ?)";
            let parameters4;

            try {

              let currInventory = results[0][0].inventory;
              let existingItem = currInventory.filter((item) => {
                item.itemID == req.body.itemID;
              })

              if (existingItem.length > 0) {
                existingItem[0].quantity += req.body.quantity;

              } else {

                let newItem = {
                  itemID: req.body.itemID,
                  itemName: req.body.itemName,
                  itemType: req.body.itemType,
                  itemDesc: req.body.itemDesc,
                  quantity: req.body.quantity,
                  imgLink: req.body.imgLink
                };

                currInventory.push(newItem);
              };

              parameters4 = [req.body.playerID, currInventory];
              database.query(sql4, parameters4, (updateError, updateResults) => {

                if (updateError) {
                  console.log("update_inventory error: " + updateError);
                  res.json(createResponse(201, false, "update inventory error"));
                };

                try {
                  //let updatedInventory = [];
                  //for (let i = 0; i < updateResults[0][0].inventory.length; i++) {
                    //let inventoryItem = {
                      //itemID: updateResults[0][0].inventory[i].itemID,
                    //}
                    //updateInventory.push();
                  //}
                  res.json(createResponse(200, updateResults[0][0].inventory, null));
                } catch (error) {

                  console.log("update_inventory result processing error: " + updateError);
                  res.json(createResponse(202, false, "Inventory Update Processing Error"));
                };

              })

            } catch (error) {
              console.log("inventory processing error");
              res.json(202, false, "Inventory Processing Error");
            }


          })

          //res.json(createResponse(200, true, null));

        })

      } catch (error) {

        console.log("add_order query setup error: " + error);
        res.json(createResponse(202, false, "add_order query setup error"));
      };

    })

  } catch (error) {
    console.log("add_order qurey error: " + error);
    res.json(createResponse(203, false, "Add Order Query Error"));
  }
})

app.post("/betterSubmitOrder", (req, res) => {

  try {
    let sql = "Call add_transaction(?)"
    let parameters = [req.body.playerID];
    database.query(sql, parameters, (error, results) => {
      if (error) {
        console.log("Add Transaction Query Error: " + error);
        res.json(createResponse(201, false, "Transaction Query Error"))
        return;
      };

      try {
        let orderSql = "Call new_add_order(?, ?, ?)";
        let orderParameters = [results[0][0].transaction_id, req.body.itemID, req.body.quantity];
        database.query(orderSql, orderParameters, (orderError, orderResults) => {
          if (orderError) {
            console.log("Add Order Query Error: " + orderError);
            res.json(createResponse(201, false, "Add Order Query Error"))
            return;
          };
          res.json(createResponse(200, true, null));

        })

      } catch (error) {
        console.log("Add Order Processing Error: " + error);
        res.json(createResponse(202, false, "Order Processing Error"))
        return;
      }

    })

  } catch (error) {

    console.log("new add order error: " + error);
    res.json(createResponse(203, false, "Add Order Error"));
    return;
  };

})



app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("http://localhost:4200/")
  });
})



//start listening on port 3000
app.listen(3000, (err) =>{
  if (err) {
    console.log(err)
  } else {
    console.log("listening on 3000");
  }
});


export default app;
