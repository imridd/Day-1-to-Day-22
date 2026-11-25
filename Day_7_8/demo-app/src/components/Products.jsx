import { Component } from "react";
class Products extends Component{
    constructor(){
        super();
        this.message="Details";
        this.products={
            id:"P101",
            name:"FaceWash",
            price:"299"
        };
    }
    render(){
        const{message,products}=this;
        return(
            <div>
                <h2>Product Class Component</h2>
                <p>Message:{message}</p>
                <p>Product id:{products.id}</p>
                <p>Product Name:{products.name}</p>
                <p>Product Price:{products.price}</p>
            </div>
        )
    }
}
export default Products;