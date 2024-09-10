import React from 'react';
import { listRestaurants } from "./graphql/queries";
import { createRestaurant, deleteRestaurant } from "./graphql/mutations";
// import logo from './logo.svg';
import { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import './App.css';
import {Amplify} from 'aws-amplify';
// import {API} from 'aws-amplify';
import awsmobile from './aws-exports';

import { generateClient } from 'aws-amplify/api';
import {
  withAuthenticator,
  View,
  Heading,
  Button,

} from '@aws-amplify/ui-react';



const client = generateClient();




Amplify.configure(awsmobile)

function App({ signOut }) {
  const [restaurantList, setRestaurantList] = useState([]);
  const [input, setInput] = useState({
    name: "",
    description: "",
    city: "",
  });

  const getRestaurantListFromAPI = async () => {
    //make an API call to get list of restaurants
    const result = await client.graphql({ query: listRestaurants });
    //get the items list from the response
    const restaurantsFromAPI = result.data.listRestaurants.items;
    //set items list to the state variable restaurantList
    setRestaurantList(restaurantsFromAPI);
  };
  
  const createARestaurant = async (e) => {
    //Stop page from refreshing onSubmit
    e.preventDefault();

    //Make the API operation of creating the restaurant
    //From the input state object variable created above .
    await client.graphql({
      query: createRestaurant,
      variables: { input: input },
    });

   console.log()

    /* After posting the restaurant data to the API
    We fetch the list of restaurants to update the list on the page
    */
    getRestaurantListFromAPI();
    setInput({ name: "", description: "", city: "" });
  };

  const deleteARestaurant = async ({ id }) => {
    /*
    Use javascript's array filter to sift through the 
    Restaurant list and take out the element with the provided
    ID
    */
    const newRestaurantList = restaurantList.filter((item) => item.id !== id);

    //The returned list is passed into the state variable
    setRestaurantList(newRestaurantList);

    //Make the API operation of deleting the restaurant
    try {
      await client.graphql({
        query: deleteRestaurant,
        variables: { input: { id } },
      });
    } catch (e) {
      console.log({ Error: e?.message });
    } finally {
    }
  };

  //We run this hook only ONCE after render!
  useEffect(() => {
    getRestaurantListFromAPI();
  }, []);

  return (
    <React.Fragment>
      <div>
        <div />
        <section style={{ borderBottom: "1px solid #abc" }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 1rem",
                backgroundColor: "#aabbcc",
              }}
            >
              <h2>My Backend Yelp App</h2>
              <button
                id="hover-button"
                style={{
                  height: "100%",
                  padding: ".5rem 2rem",
                  cursor: "pointer",
                }}
                onClick={signOut}
              >
                Sign Out
              </button>
            </div>

            <Heading
              level={4}
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "2rem",
                marginBottom: "0px",
              }}
            >
              Add a Restaurant
            </Heading>

            <View as="form" onSubmit={createARestaurant}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <input
                  placeholder="Restaurant Name"
                  variation="quiet"
                  required
                  value={input.name}
                  onChange={(e) => setInput({ ...input, name: e.target.value })}
                  style={{ margin: "2rem", flex: 1 }}
                />
                <input
                  placeholder="Description"
                  variation="quiet"
                  required
                  value={input.description}
                  onChange={(e) =>
                    setInput({ ...input, description: e.target.value })
                  }
                  style={{ margin: "2rem", flex: 1 }}
                />
                <input
                  placeholder="Restaurant City"
                  variation="quiet"
                  required
                  value={input.city}
                  onChange={(e) =>
                    setInput({ ...input, city: e.target.value })
                  }
                  style={{ margin: "2rem", flex: 1 }}
                />
                <Button
                  type="submit"
                  style={{
                    margin: "2rem",
                    flex: 1,
                    padding: ".5rem 2rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Create Restaurant
                </Button>
              </div>
            </View>
          </div>
        </section>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            margin: "2rem 0",
          }}
        >
          <Heading level={4} style={{ marginBottom: "1rem" }}>
            List Of Restaurants ({restaurantList.length})
          </Heading>
          <section>
            {restaurantList.length >= 1 ? (
              <table striped bordered hover size="sm" responsive variant="dark">
                <thead>
                  <tr>
                    <th style={{ flex: 1 }}>Restaurant Name</th>
                    <th style={{ flex: 1 }}>Description</th>
                    <th style={{ flex: 1 }}>City</th>
                    <th style={{ flex: 1 }}> Action </th>
                  </tr>
                </thead>
                <tbody>
                {restaurantList?.map((item, key) => (
                  
                  <React.Fragment key={key}>
                    <tr >
                      <td>{item?.name}</td>
                      <td>{item?.description}</td>
                      <td>{item?.city}</td>
                      <td>
                        <button
                          onClick={() => deleteARestaurant(item)}
                          style={{ fontWeight: "bold", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
  
                    </tr>
                  </React.Fragment>
                  
                ))}
                </tbody>
              </table>
            ) : (
              <p>No Restaurant In The List. Please Add Restaurants.</p>
            )}
          </section>
        </div>
      </div>
    </React.Fragment>
  );


}

export default withAuthenticator(App);
