import React, { Component } from "react";
import Card from "react-bootstrap/Card";

class PhotoComponent extends Component {
  render() {
    const { photo } = this.props;

    return (
      <Card className="h-100 shadow-sm">
        <Card.Img
          variant="top"
          src={photo.thumbnailUrl}
          alt={photo.title}
        />
        <Card.Body>
          <Card.Title>ID : {photo.id}</Card.Title>
          <Card.Text>
            <strong>Title :</strong> {photo.title}
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default PhotoComponent;