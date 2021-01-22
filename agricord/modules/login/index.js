import React, {Component} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import {faLock, faUserAlt} from '@fortawesome/free-solid-svg-icons';
import LoginInputField from 'modules/login/LoginInputField';
import SignInButton from 'modules/login/SignInButton';
import styles from 'modules/login/Styles.js';
import {Spinner} from 'components';
import Api from 'services/api/index.js';
import {Routes, Helper} from 'common';
import config from 'src/config';
import SystemVersion from 'services/System.js';
import { Player } from '@react-native-community/audio-toolkit';
import AsyncStorage from '@react-native-community/async-storage';
import {Notifications, NotificationAction, NotificationCategory} from 'react-native-notifications';

const win = Dimensions.get('window');
const ratio = (win.width / 4336) * 0.7;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      username: '',
      password: '',
      error: 0,
      errorMessage: '',
      token: null,
      isResponseError: false,
    };
  }

  componentDidMount(){
    // if(config.versionChecker == 'store'){
    //   this.setState({isLoading: true})
    //   SystemVersion.checkVersion(response => {
    //     this.setState({isLoading: false})
    //     if(response == true){
    //       this.getData();
    //     }
    //   })
    // }else{
    //   this.getData(); 
    // }
    // this.audio = new Player('assets/notification.mp3');
    // const initialNotification = await Notifications.getInitialNotification();
    // if (initialNotification) {
    //   this.setState({notifications: [initialNotification, ...this.state.notifications]});
    // }
    this.getData(); 
  }


  getData = async () => {
    try {
      const token = await AsyncStorage.getItem(Helper.APP_NAME + 'token');
      if(token != null) {
        this.setState({token});
        this.login();
      }
    } catch(e) {
      // error reading value
    }
  }

  login = () => {
    this.test();
    const { login } = this.props;
    console.log('test')
    if(this.state.token != null){
      this.setState({isLoading: true});
      Api.getAuthUser(this.state.token, (response) => {
        login(response, this.state.token);
        let parameter = {
          condition: [{
            value: response.id,
            clause: '=',
            column: 'id'
          }]
        }
        console.log('parameter', parameter)
        Api.request(Routes.accountRetrieve, parameter, userInfo => {
          if(userInfo.data.length > 0){
            login(userInfo.data[0], this.state.token);
            this.retrieveUserData(userInfo.data[0].id)
          }else{
            this.setState({isLoading: false});
            login(null, null)
          }
        }, error => {
          this.setState({isResponseError: true})
        })
      }, error => {
        this.setState({isResponseError: true})
      })
    }
  }

  test = () => {
    if(config.TEST == true){
      this.props.navigation.navigate('drawerStack');
      return true;
    }
  }

  retrieveUserData = (accountId) => {
    if(Helper.retrieveDataFlag == 1){
      this.setState({isLoading: false});
      this.props.navigation.navigate('drawerStack');  
    }else{
      // const { setNotifications, setMessenger } = this.props;
      // let parameter = {
      //   account_id: accountId
      // }
      // this.retrieveSystemNotification();
      // Api.request(Routes.notificationsRetrieve, parameter, notifications => {
      //   setNotifications(notifications.size, notifications.data)
      //   Api.request(Routes.messagesRetrieve, parameter, messages => {
      //     setMessenger(messages.total_unread_messages, messages.data)
      //     this.setState({isLoading: false});
      //     Pusher.listen(response => {
      //       this.managePusherResponse(response)
      //     });
      //     // this.props.navigation.replace('loginScreen')
      //     this.checkOtp()
      //   }, error => {
      //     this.setState({isResponseError: true})
      //   })
      // }, error => {
      //   this.setState({isResponseError: true})
      // })
    }
  }


  submit(){
    this.test();
    const { username, password } = this.state;
    const { login } = this.props;
    if((username != null && username != '') && (password != null && password != '')){
      this.setState({isLoading: true, error: 0});
      // Login
      Api.authenticate(username, password, (response) => {
        if(response.error){
          this.setState({error: 2, isLoading: false});
        }
        if(response.token){
          const token = response.token;
          Api.getAuthUser(response.token, (response) => {
            login(response, token);
            let parameter = {
              condition: [{
                value: response.id,
                clause: '=',
                column: 'id'
              }]
            }
            Api.request(Routes.accountRetrieve, parameter, userInfo => {
              if(userInfo.data.length > 0){
                login(userInfo.data[0], token);
                this.retrieveUserData(userInfo.data[0].id)
              }else{
                this.setState({isLoading: false});
                this.setState({error: 2})
              }
            }, error => {
              this.setState({isResponseError: true})
            })
            
          }, error => {
            this.setState({isResponseError: true})
          })
        }
      }, error => {
        console.log('error', error)
        this.setState({isResponseError: true})
      })
      // this.props.navigation.navigate('drawerStack');
    }else{
      this.setState({error: 1});
    }
  }

  usernameHandler = value => {
    this.setState({username: value});
  };

  passwordHandler = value => {
    this.setState({password: value});
  };

  render() {
    const { isLoading, error, isResponseError } = this.state;
    return (
      <ImageBackground
        source={require('assets/backgroundlvl1.png')}
        style={styles.BackgroundContainer}>
        <ScrollView style={{height: '100%'}}>
          {this.state.isLoading ? <Spinner mode="overlay" /> : null}
          <View style={styles.LoginContainer}>
            <Image
              source={require('assets/logo.png')}
              style={styles.LogoContainer}
            />
            <Image
              source={require('assets/agricordLogo03.png')}
              style={styles.TitleContainer}
            />
            <View style={styles.SignInTextContainer}>
              <Text style={styles.SignInTextStyle}>
                Sign In to Your Account
              </Text>
            </View>
            {error > 0 ? <View style={styles.messageContainer}>
              {error == 1 ? (
                <Text style={styles.messageText}>Please fill up the required fields.</Text>
              ) : null}

              {error == 2 ? (
                <Text style={styles.messageText}>Username and password didn't match.</Text>
              ) : null}
            </View> : null}
            <View style={styles.UsernameContainer}>
              <LoginInputField
                icon={faUserAlt}
                placeholder="Username or Username"
                handler={this.usernameHandler}
              />
            </View>
            <View style={styles.PasswordContainer}>
              <LoginInputField
                icon={faLock}
                secureTextEntry={true}
                placeholder="Password"
                handler={this.passwordHandler}
              />
            </View>
            <TouchableOpacity
              onPress={() => {}}
              style={styles.CreateAccountContainer}>
              <Text style={styles.CreateAccountTextStyle}>Create Account</Text>
            </TouchableOpacity>
            <View style={styles.SignInButtonContainer}>
              <SignInButton
                onPress={() => {
                  console.log('Click');
                  this.submit();
                }}
              />
            </View>
            <View style={styles.ForgottenPasswordContainer}>
              <View style={styles.ForgottenPasswordTextContainer}>
                <Text style={styles.ForgottenPasswordTextStyle}>
                  Forgotten Password?
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const {navigate} = this.props.navigation;
                  navigate('ForgotPassword');
                }}
                style={styles.SendCodeContainer}>
                <Text style={styles.SendCodeTextStyle}> Send Code</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.DrumScanContainer}
              onPress={() => {
                this.props.navigation.navigate('drumScanLoginStack');
              }}>
              <View style={styles.DrumScanTextContainer}>
                <Text style={styles.DrumScanTextStyle}>
                  Don't have an account? Click here to DrumScan
                </Text>
              </View>
              <View>
                <Image
                  source={require('assets/nfc.png')}
                  style={{height: 50, width: 50, marginLeft: 25}}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }
}

const mapStateToProps = state => ({state: state});

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {
    login: (response, token) => {
      dispatch(actions.login(response, token));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
