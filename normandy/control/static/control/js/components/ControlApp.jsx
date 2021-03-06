import React from 'react'
import Header from './Header.jsx'

export default class ControlApp extends React.Component {
  render() {
    return (
      <div>
        <Header pageType={this.props.children.props.route} currentLocation={this.props.location.pathname} />
        <div id="content" className="wrapper">
          <div className="fluid-8">
            {
              React.Children.map(this.props.children, (child) => React.cloneElement(child))
            }
          </div>
        </div>
      </div>
    )
  }
}
