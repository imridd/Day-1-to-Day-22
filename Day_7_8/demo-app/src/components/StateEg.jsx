import React, { Component } from "react";
class StateEg extends Component {
  state = {
    items: []
  };
  addItem = () => {
    this.setState(prev => {
      const id = prev.items.length + 1;
      return {
        items: [ ...prev.items,
          {
            id,
            name: `NewItem ${id}`,
            isActive: true
          }
        ]
      };
    });
  };
  render() {
    const { items } = this.state;
    return (
      <>
        <button onClick={this.addItem}>Add Item</button>
        {items.length > 0 && (
          <table border="1">
            <thead>
              <tr>
                {Object.keys(items[0]).map(key => (
                  <th key={key}>{key.toUpperCase()}
                  </th>
                ))}

              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>{Object.values(item).map((value, index) => (
                    <td key={index}>
                      {value.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    );
  }
}
export default StateEg;