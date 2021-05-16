import React, { useState, useInterval } from "react"; 
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
} from "reactstrap";
import './Tabs.scss';
// Dummy data
const tabData = [
    [
      {
        name: 'Search By PIN',
        content: `Apple Inc. is an American multinational technology company headquartered in Cupertino, California that designs, develops, and sells consumer electronics, computer software, and online services. The company's hardware products include the iPhone smartphone, the iPad tablet computer, the Mac personal computer, the iPod portable media player, the Apple Watch smartwatch, and the Apple TV digital media player. Apple's consumer software includes the macOS and iOS operating systems, the iTunes media player, the Safari web browser, and the iLife and iWork creativity and productivity suites. Its online services include the iTunes Store, the iOS App Store and Mac App Store, Apple Music, and iCloud.`,
      },
      {
        name: 'Search By District',
        content: `Google is an American multinational technology company specializing in Internet-related services and products. These include online advertising technologies, search, cloud computing, software, and hardware. Google was founded in 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University, in California. Together, they own about 14 percent of its shares, and control 56 percent of the stockholder voting power through supervoting stock. They incorporated Google as a privately held company on September 4, 1998. An initial public offering (IPO) took place on August 19, 2004, and Google moved to its new headquarters in Mountain View, California, nicknamed the Googleplex. In August 2015, Google announced plans to reorganize its various interests as a conglomerate called Alphabet Inc. Google, Alphabet's leading subsidiary, will continue to be the umbrella company for Alphabet's Internet interests. Upon completion of the restructure, Sundar Pichai became CEO of Google, replacing Larry Page, who became CEO of Alphabet.`,
      },
      {
        name: 'Search By Date',
        content: `Facebook is an American for-profit corporation and an online social media and social networking service based in Menlo Park, California. The Facebook website was launched on February 4, 2004, by Mark Zuckerberg, along with fellow Harvard College students and roommates, Eduardo Saverin, Andrew McCollum, Dustin Moskovitz, and Chris Hughes`,
      },
    ]
  ];
  
  /*
  *
  * App wrapper
  *
  */
  const App = () =>
    <div class="App">
      <TabContainer defaultTab={0} tabData={tabData[0]}/>
    </div>;
  
  /*
  *
  * TabPanel component. 
  * Displays content data passed down by TabContainer.
  *
  */
  const TabPanel = ({ content }) => 
    <div className="TabPanel">
      <p>{content}</p>
    </div>;
  
  /*
  *
  * Tab component.
  *
  */
  class Tab extends React.Component {
    _handleClick(e) {
      const { setCurrentTab, index } = this.props;
      setCurrentTab(index);
    }
  
    render() {
      const { text, isSelected } = this.props;
      return (
        <Col
          md="4"
          lg="4" 
          className={`Tab${isSelected ? ' is-selected' : ''}`} 
          onClick={this._handleClick.bind(this)}>
          {text}
        </Col>
      );
    }
  }
  
  /*
  *
  * TabContainer component.
  *
  */
  class TabContainer extends React.Component {
    constructor(props) {
      super(props);
  
      // Set initial state
      this.state = {
        currentTab: this.props.defaultTab,
      };
      
      // Dummy data
      this._tabData = this.props.tabData;
    }
  
    _setCurrentTab(currentTab) {
      // Don't re-render if current tab is clicked again
      if (this.state.currentTab === currentTab) {
        return;
      }
      this.setState({ currentTab });
    }
  
    _renderTabs() {
      // Map data to Tab component. 
      // Pass index down so we can send it up to this.state later.
      return (
        <ul md="12" className="Tabs">
          {
            this._tabData.map((tab, index) => {
              return (
                <Tab
                  index={index}
                  text={tab.name}
                  isSelected={this.state.currentTab === index}
                  setCurrentTab={this._setCurrentTab.bind(this)}
                />
              )
            })
          }
        </ul>
      );
    }
  
    _renderTabPanel() {
      // Map data to TabPanel component
      return this._tabData.map((tab, index) => {
        if (this.state.currentTab === index) {
          return (
            <TabPanel 
              content={tab.content} />
          );
        }
      });
    }
  
    render() {
      const Tabs = this._renderTabs();
      const TabPanel = this._renderTabPanel();
      return (
        <div className="TabContainer">
          {Tabs}
          {/* {TabPanel} */}
        </div>
      );
    }
  }

  export default App;