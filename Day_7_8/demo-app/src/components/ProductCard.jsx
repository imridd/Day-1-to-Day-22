const ProductCard = () => {
    const product = {id: "P101",name: "Face Wash",price: 299,isAvailable: true
    };
    return (
        <>
        {product.isAvailable && (
                <article>
                    <h2>Product : {product.name}</h2>
                    <p>Product ID : {product.id}</p>
                    <p>Price : ₹{product.price}</p>
                </article>
            )}
        </>
    );
};
export default ProductCard;