import React from "react";
import { useParams } from "react-router-dom";
import PathfindingView from "./PathfindingView";
import styled from "styled-components";

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const ProductPathfinding = () => {
  const { productId } = useParams();

  return (
    <Container>
      <Header>
        <h2>Product Location</h2>
        <p>Follow the highlighted path to find your product</p>
      </Header>
      <PathfindingView productId={productId} />
    </Container>
  );
};

export default ProductPathfinding;
