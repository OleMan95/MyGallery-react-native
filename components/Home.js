import React, { Component } from 'react';
import { StyleSheet, NativeModules, Image, Text, View, StatusBar, ToastAndroid, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Footer, FooterTab, Container, Header, Content, List, ListItem, Left, Right, Button, Icon, Body, Title, Spinner, Toast} from 'native-base';
import { StackNavigator } from 'react-navigation';
import CardImage from './CardImage.js';


const { StatusBarManager } = NativeModules;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showText: true,
      receivedData: false,
      imageCards: [],
      pageToDownload: 1,
      currentPage: 1,
      showToast: false,
      photos: [],
      isReady:false,
    };
  }
  static navigationOptions = {
    header: null,
  };

  renderImageCards=(i, data)=>{
    const { navigate } = this.props.navigation;
    var url = data.photos[i].image_url;
    var authorIcon = data.photos[i].user.userpic_url;
    var author = data.photos[i].user.fullname;
    var imgName = data.photos[i].name;
    var rating = data.photos[i].rating;
    var comments = data.photos[i].comments_count;
    return (<TouchableOpacity style={styles.imageCard} activeOpacity={1.0} key={i} onPress={()=>navigate('FullScreenCardImage', {
          url:url,
          authorIcon:authorIcon,
          author:author,
          imgName:imgName,
          rating:rating,
          comments:comments,
        })}>
      <CardImage id={i} url={url}
      authorIcon={authorIcon}
      author={author}
      name={imgName}
      rating={rating}
      comments={comments}/>
    </TouchableOpacity>);
  }

  checkPage=(page)=>{
    this.setState({
      receivedData:false,
      pageToDownload:page
    });
    return page;
  }
  onPressPreviousPage=()=>{
    var prevPage = this.state.pageToDownload-1;
    console.log('to download'+prevPage);
    if (prevPage<1) {
      return;
    }
    this.loadData(this.checkPage(prevPage));

  }
  onPressNextPage=()=>{
    var nextPage = this.state.pageToDownload+1;
    console.log('to download'+nextPage);
    this.loadData(this.checkPage(nextPage));
  }

  loadData=(page)=>{
    console.log('начинается загрузка: '+page);
    var url = 'https://api.500px.com/v1/photos?feature=popular&consumer_key=wB4ozJxTijCwNuggJvPGtBGCRqaZVcF6jsrzUadF&page='+page;
    fetch(url)
    .then((response) => {
      if(!response.ok) alarm('Download error!');
      return response;
    }).then((response) => response.json())
    .then((data) => {
        // var data = JSON.stringify(responseData);
        var imageCards = new Array();
        var photos = new Array();
        photos.push(data.photos);

        for (var i = 0; i < data.photos.length; i++) {
          imageCards.push(
            this.renderImageCards(i, data)
          );
        }
        this.setState({
          imageCards: imageCards,
          receivedData:data,
          currentPage:data.current_page,
          photos:photos,
        });

        // console.log(this.state.photos);

        console.log('загружено: '+data.current_page);
        this.shouldComponentUpdate(this.state);
    })
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
    });

    this.setState({ isReady: true });
  }
  componentDidMount = () => {
    StatusBar.setHidden(true);
    console.log('componentDidMount');
    this.loadData(this.state.currentPage);
  }

  shouldComponentUpdate(state){
    // console.log(state.receivedData);
    if (!state.receivedData) {
      return true;
    }

    return false;
  }



  render = () => {
    let display;
    let isDisabled;
    let page = 'page '+this.state.currentPage;

    if (!this.state.isReady) return <Expo.AppLoading />;

    if (!this.state.receivedData){
      isDisabled = true;
      display =  (
          <View style={styles.spinnerView}>
            <ActivityIndicator color='#90a4ae' size="large" />
          </View>
        );
    }
    else {
      // ToastAndroid.show('Page: '+this.state.receivedData.current_page, ToastAndroid.SHORT)
      isDisabled = false;

      display =  (
        <Content>
          {this.state.imageCards}
        </Content>
        );
    }


    return (
      <Container >
        <Header  style={styles.header}>
          <Left>
            <Button transparent>
              <Icon name='menu'/>
            </Button>
          </Left>
          <Body>
            <Title>MyGallery</Title>
          </Body>
          <Right>
            <Text style={styles.headerText}>{page}</Text>
          </Right>
        </Header>
        {display}
        <Footer>
          <FooterTab style={styles.footerBtns}>
            <Button disabled = {isDisabled} onPress={this.onPressPreviousPage} >
              <Text style={styles.footerText}>Previous page</Text>
            </Button>
            <Button disabled = {isDisabled} onPress={this.onPressNextPage} >
              <Text style={styles.footerText}>Next page</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingText:{
    width:100,
    height:100,
    alignItems:'center',
    flexGrow:1,
    justifyContent:'center',
  },
  footerText:{
    color:'#fff',
    fontSize:16,
  },
  headerText:{
    color:'#fff',
  },
  header:{
    backgroundColor:'#546e7a',
  },
  footerBtns:{
    backgroundColor:'#546e7a'
  },
  content:{
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  spinnerView:{
    flex:1,
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center'
  },
});
