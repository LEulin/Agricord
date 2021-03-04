import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Image
} from 'react-native';
import { ListItem } from 'react-native-elements'
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Color, BasicStyles, Routes } from 'common';
import Style from './Style.js';
import Api from 'services/api/index.js';

import Background from 'assets/inventory/background.svg';
import ItemImage from 'assets/inventory/temp_item.svg';
import FileIcon from 'assets/inventory/file_icon.svg';
import CheckIcon from 'assets/inventory/check_icon.svg';
import { Spinner } from 'components';
import { data } from '../batchPage/data-test.js';
import Config from 'src/config';

const height = Math.round(Dimensions.get('window').height);

class ProductDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      loading: false,
      data: null,
      safetyEquipments: [],
    }
  }

  componentDidMount(){
    this.retrieve()
  }

  retrieve(){
    const { user, selectedOrder } = this.props.state;
    if(user == null || !this.props.navigation.state.params || (this.props.navigation.state.params && this.props.navigation.state.params.data == null)){
      return
    }

    let parameter = {
      condition: [{
        value: this.props.navigation.state.params.data.product_id ? this.props.navigation.state.params.data.product_id : this.props.navigation.state.params.data.id,
        clause: '=',
        column: 'id'
      }],
      inventory_type: 'product_trace',
      account_id: user.id,
      order_request_id: selectedOrder ? selectedOrder.id : null
    }
    this.setState({
      loading: true
    })
    Api.request(Routes.productsRetrieveWithOrderId, parameter, response => {
        this.setState({
          loading: false
        })
        if(response.data !== null && response.data.length > 0){
          this.setState({data: response.data[0]})
        }else{
          this.setState({data: null})
        }
      },
      error => {
        this.setState({
          loading: false
        })
        console.log({error});
      },
    );
  }

  renderModal(data){
    console.log("DATA", data);
    let details = JSON.parse(data.details)
    const { modal } = this.state;
    return(
      <Modal
        animationType="slide"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={Style.modalBody}>
            <TouchableOpacity
              style={Style.modalCloseBtn}
              onPress={() => this.setState({
                modal: false
              })}
            >
              <FontAwesomeIcon
                style={{ color: Color.gray }}
                icon={faTimesCircle}
                size={25}
              />
            </TouchableOpacity>

            <Text style={Style.modalTitle}>
              Recommended Personal Protective Equipment
            </Text>

            <View style={Style.modalContent}>
              {
              data && details && details.safety_equipment.map(item => (
              <View style={Style.modalContentRow}>
                <CheckIcon />
                <Text style={{ paddingHorizontal: 20 }}>
                  {item}
                </Text>
              </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  productImage(data){
    return (
      <View style={Style.itemContainer}>
        <View style={Style.itemDescription}>
          {
            (data && data.featured) && (
                <Image
                  source={{uri: Config.BACKEND_URL  + data.featured[0].url}}
                  style={{
                      height: 100,
                      width: 100,
                      borderRadius: BasicStyles.standardBorderRadius
                  }}/>
              )
          }
          {
            (data && data.featured == null) && (
                <ItemImage />
              )
          }
          {
            data && (
              <Text style={{ paddingHorizontal: 10, textAlign: 'center', paddingTop: 10, fontSize: BasicStyles.standardFontSize }}>
                {data.description}
              </Text>
            )
          }
        </View>
      </View>
      )
  }

  productInformation(data){
    let details = JSON.parse(data.details)
    console.log("[PRODUCT]", details);
    return(
      <View style={Style.Details}>
        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Manufacturer
          </Text>
        
           {
            data && (
              <Text style={Style.itemDetailValue}>
                {data.merchant.name || 'No data'}
              </Text>
            )
          }
        </View>

        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Type
          </Text>
        
          {
            data && (
              <Text style={Style.itemDetailValue}>
                {data.tags || 'No data'}
              </Text>
            )
          }
        </View>


        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Group
          </Text>
          <View>
          {
            !Array.isArray(details.group) ? (
              <Text style={{fontSize: 12}}>{details.group}</Text>
            ) : (
              details.group && details?.group.map((el, idx) => (
                  <ListItem key={idx}>
                      <Text style={{fontSize: 12}}>{el.group || 'No Data'}</Text>
                  </ListItem>
              ))
            )
          }
          </View>
        </View>


        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Active
          </Text>
          <View>
          {
            !Array.isArray(details.active) ? (
              <Text style={{fontSize: 12}}>
                {`${details.active.active_name}` || 'No data'}
                </Text>
            ) : (
              data && details?.active.map((el, idx) => {
                return(
                  <ListItem key={idx}>
                      <Text style={{fontSize: 12}}>{el.active_name || 'No Data'}</Text>
                  </ListItem>
                )
              })
            )
          }
          </View>
        </View>


        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Solvent
          </Text>
        
          {
            data && (
              <Text style={Style.itemDetailValue}>
                {details.solvent || 'No data'}
              </Text>
            )
          }
        </View>

        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Volume
          </Text>
        
          {
            data && (
              <Text style={Style.itemDetailValue}>
                {this.props.navigation.state.params.data.variation ? this.props.navigation.state.params.data.variation[0].payload_value + this.props.navigation.state.params.data.variation[0].payload : (data.volume ? data.volume : 'No data')}
              </Text>
            )
          }
        </View>

        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Formulation
          </Text>
        
          {
            data  && (
              <Text style={Style.itemDetailValue}>
                {details.formulation || 'No data'}
              </Text>
            )
          }
        </View>

        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Mixing order
          </Text>
        
          {
            data && (
              <Text style={Style.itemDetailValue}>
                {details.mixing_order || 'No data'}
              </Text>
            )
          }
        </View>

        <View style={Style.itemDetailsContainer}>
          <Text style={Style.itemDetailLabel}>
            Safety Equipment
          </Text>
        
          <TouchableOpacity
            onPress={() => this.setState({
                modal: true
              })}
            style={{
              width: '50%'
            }}
            >
            <Text style={[Style.itemDetailValue, { color: '#5A84EE', width: '100%' }]}>
              Click to show
            </Text>
          </TouchableOpacity>
        </View>


        

        {
          (data && data.product_trace) && (
            <View style={Style.itemDetailsContainer}>
              <Text style={Style.itemDetailLabel}>
                Batch
              </Text>
              <Text style={Style.itemDetailValue}>
                {
                  data?.product_trace?.batch_number
                }
              </Text>
            </View>
          )
        }

        {
          (data && data.product_trace) && (
            <View style={Style.itemDetailsContainer}>
              <Text style={Style.itemDetailLabel}>
                Manufactured
              </Text>
              <Text style={Style.itemDetailValue}>
                {
                  data?.product_trace?.manufacturing_date
                }
              </Text>
            </View>
          )
        }

      </View>
    )
  }

  recentFiles(data){
    let details = JSON.parse(data.details)
    return(
      <View style={{
        width: '90%',
        marginLeft: '5%',
        marginRight: '5%'
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10, marginBottom: 10, marginTop: 10 }}>
          Recent Files
        </Text>
        <View
          style={[Style.itemDescContainer, {
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }]}
        >
          <View>
          {
            Array.isArray(details.files) ? (
              data && details && details.files.map(item => (
                <View style={Style.fileUploaded}>
                <View>
                  <FileIcon />
                  <Text style={Style.fileUploadedText}>
                    {item.label.title}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  <FileIcon />
                  <Text style={Style.fileUploadedText}>
                    {item.sds.title}
                  </Text>
                </View>
              </View>
              ))
            ) : (
              <View style={Style.fileUploaded}>
                <View>
                  <FileIcon />
                  <Text style={Style.fileUploadedText}>
                    {details.files.label.title}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  <FileIcon />
                  <Text style={Style.fileUploadedText}>
                    {details.files.sds.title}
                  </Text>
                </View>
              </View>
            )
          }
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { data } = this.state
    const { modal, loading } = this.state;
    console.log('data', data)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: Color.containerBackground
        }}>
        {data && this.renderModal(data)}

        <ScrollView showsVerticalScrollIndicator={false}>
          <Background style={{ position: 'absolute' }} />
          <View style={
            Style.MainContainer,
            {
              minHeight: height + 25,
              width: '90%',
              marginLeft: '5%',
              marginRight: '5%',
              marginBottom: 100,
              marginTop: 25
            }
          }>
            {data && this.productImage(data)}

            {data && this.productInformation(data)}

            {data && this.recentFiles(data)}
          </View>


        </ScrollView>
        {loading ? <Spinner mode="overlay" /> : null}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({state: state});
const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProductDetails);
