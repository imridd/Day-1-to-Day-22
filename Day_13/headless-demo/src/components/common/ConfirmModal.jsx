import Modal
from "react-bootstrap/Modal";

import Button
from "react-bootstrap/Button";

function ConfirmModal({

 show,

 onClose,

 onConfirm,

 title

}) {

 return (

 <Modal
 show={show}
 onHide={onClose}
 centered
 >

 <Modal.Header
 closeButton
 >

 <Modal.Title>

 Delete Confirmation

 </Modal.Title>

 </Modal.Header>

 <Modal.Body>

 Are you sure
 you want to delete
 {title}?

 </Modal.Body>

 <Modal.Footer>

 <Button
 variant="secondary"
 onClick={onClose}
 >
 Cancel
 </Button>

 <Button
 variant="danger"
 onClick={onConfirm}
 >
 Delete
 </Button>

 </Modal.Footer>

 </Modal>

 );

}

export default ConfirmModal;