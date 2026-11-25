function CardList({
  data,
  renderItem,
}) {
  return (
    <div className="employee-grid">
      {data.map((item) =>
        renderItem(item)
      )}
    </div>
  );
}

export default CardList;