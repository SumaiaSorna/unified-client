import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Divider } from "@mui/material";
import { Box } from "@mui/system";
import Container from "@mui/material/Container";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ItemCard } from "../components/ItemCard";
import { VIEW_ALL_ITEMS, VIEW_MY_ITEMS_FOR_SALE } from "../queries";
import { ADD_TO_MY_ITEMS, DELETE_ITEM } from "../mutations";

export const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState("allItems");
  const [selectedItem, setSelectedItem] = useState();
  const [itemsToDisplay, setItemsToDisplay] = useState([]);
  const [interestedItems, setInterestedItems] = useState([]);

  const [executeAddItemToInterested, addItemToInterested] =
    useMutation(ADD_TO_MY_ITEMS);

  const {
    data: itemData,
    loading: itemLoading,
    error: itemError,
    refetch,
  } = useQuery(VIEW_ALL_ITEMS);

  const [getMyItems, { loading: myItemsLoading, error: myItemsError }] =
    useLazyQuery(VIEW_MY_ITEMS_FOR_SALE);

  const [executeDeleteItem, { loading, error }] = useMutation(DELETE_ITEM);

  useEffect(() => {
    if (
      !itemLoading &&
      itemData?.viewAllItems &&
      selectedValue === "allItems"
    ) {
      setItemsToDisplay(itemData?.viewAllItems);
    }
  }, [itemData, selectedValue]);

  const handleChange = async (event, value) => {
    setSelectedValue(value);
    if (value === "allItems") {
      refetch();
    }

    if (value === "myItems") {
      const { data: myItemsData } = await getMyItems();

      setItemsToDisplay(myItemsData?.viewMyItems);
    }
  };

  // Delete an Item if the user created the listing
  const onDelete = async (event) => {
    const itemId = event.target.id;
    try {
      const { data: deleteData, error: deleteError } = await executeDeleteItem({
        variables: {
          itemId,
        },
      });
      if (deleteError) {
        throw new Error("something went wrong!");
      }

      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  //   export const ADD_TO_MY_ITEMS = gql`
  //   mutation Mutation($itemId: String!) {
  //     saveToMyItems(itemId: $itemId) {
  //       id
  //     }
  //   }
  // `;

  // When a user selects Quick Add To Interested, add the item to their interested array
  const onAddItemToInterested = async (event) => {
    const itemId = event.target.id;
    console.log(typeof itemId);
    setSelectedItem(itemId);

    await executeAddItemToInterested({
      variables: {
        itemId: itemId,
      },
    });
  };

  // redirect to the single item page
  const viewListing = (event) => () => {
    console.log(event);
    const itemId = event.target.id;
    navigate(`listing/${itemId}`, { replace: true });
  };

  const styles = {
    container: { textAlign: "center" },
  };

  return (
    <>
      <Container component={"main"} maxWidth={"xs"} sx={styles.container}>
        <ToggleButtonGroup
          color="primary"
          value={selectedValue}
          exclusive
          onChange={handleChange}
          sx={{ margin: "25px" }}
        >
          <ToggleButton value="myItems">My Items</ToggleButton>
          <ToggleButton value="allItems">All Items</ToggleButton>
        </ToggleButtonGroup>
      </Container>
      <Divider sx={{ maxWidth: "90%", margin: "auto" }} />
      <Box sx={{ px: "32px", paddingTop: "40px" }}>
        {!myItemsLoading &&
          !itemLoading &&
          itemsToDisplay?.map((item) => {
            return (
              <ItemCard
                id={item.id}
                itemName={item.itemName}
                itemDescription={item.itemDescription}
                category={item.category}
                status={item.status}
                condition={item.condition}
                price={item.price}
                quantity={item.quantity}
                seller={item.seller.username}
                onDelete={onDelete}
                key={item.id}
                viewListing={viewListing}
                onAddItemToInterested={onAddItemToInterested}
              />
            );
          })}
      </Box>
    </>
  );
};
