import {
  Spinner
} from "react-bootstrap";

function Loader() {
  return (
    <div
      className="
      d-flex
      flex-column
      justify-content-center
      align-items-center
      vh-100
      "
    >
      <Spinner
        animation="border"
        variant="primary"
      />

      <h5 className="mt-3">
        Loading...
      </h5>
    </div>
  );
}

export default Loader;