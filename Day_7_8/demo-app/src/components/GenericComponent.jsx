import React, { Component } from "react";
import { Container, Table, Spinner, Alert } from "react-bootstrap";
class GenericComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [], loading: false, error: "" };
        this.controller = null;
    }
    fetchData = async () => {
        const { resource } = this.props;
        const validResources = ["users", "posts", "comments", "albums", "photos", "todos"];
        const resourceName = resource?.trim().toLowerCase();
        if (!resourceName) {
            this.setState({ data: [], loading: false, error: "" });
            return;
        }
        if (!validResources.includes(resourceName)) {
            this.setState({
                data: [], loading: false, error: "Invalid Resource"
            });
            return;
        }
        this.controller = new AbortController();

        try {
            this.setState({ loading: true, error: "", data: [] });
            const response = await fetch(`https://jsonplaceholder.typicode.com/${resourceName}`,
                {
                    signal: this.controller.signal
                }
            );
            if (!response.ok) throw new Error("Failed to Fetch Data");
            const result = await response.json();
            this.setState({ data: result, loading: false, error: "" });
        } catch (err) {
            if (err.name !== "AbortError") {
                this.setState({
                    error: err.message, loading: false
                });
            }
        }
    };
    componentDidMount() {
        this.fetchData();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.resource !== this.props.resource) this.fetchData();
    }
    componentWillUnmount() {
        console.log("Component Unmounted");
        if (this.controller)
            this.controller.abort();
    }
    render() {
        const { data, loading, error } = this.state;
        if (loading) {
            return (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <h5 className="mt-3">Loading Data...</h5>
                </div>
            );
            if (data.length === 0) {
                return (
                    <Alert variant="warning" className="mt-3">No Data Available</Alert>
                );
            }

        }
        if (error) {
            return (
                <Alert variant="danger" className="mt-3">{error}</Alert>
            );
        }
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        return (
            <Container className="mt-4">
                <h2 className="text-center text-success mb-4">{this.props.resource.toUpperCase()} DATA</h2>
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>{columns.map((col) => (<th key={col}>{col}</th>))}</tr>
                    </thead>
                    <tbody>
                        {data.map(
                            (item, index) => (
                                <tr key={item.id || index}>{columns.map((col) => (
                                    <td key={col}>
                                        {typeof item[col] === "object" ? JSON.stringify(item[col]) : String(item[col])}
                                    </td>))}
                                </tr>))}
                    </tbody>
                </Table>
            </Container>
        );
    }
}
export default GenericComponent;