import React,{ useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, Pressable, FlatList, ActivityIndicator } from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import ReactNativeBiometrics from 'react-native-biometrics'
import { useDispatch, useSelector } from 'react-redux';
import { userLogOut } from '../redux/slices/userSlice'
import { useIsFocused } from '@react-navigation/native';
import { getAccounts } from '../redux/slices/accountSlice'
import EncryptedStorage from 'react-native-encrypted-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StartScreen = ({navigation}) => {
    const dispatch = useDispatch()
    const rnBiometrics = new ReactNativeBiometrics()
    const accounts = useSelector(state=>state.account.accounts)
    const loading = useSelector(state=>state.account.loading)
    const [showCheckbox,setShowCheckbox]=useState(false)
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const isFocused = useIsFocused()
    
    useEffect(() => {
        navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
        Alert.alert(
            'Log out?',
            'Are you sure to Log out?, you will lose biometric autentication',
            [{ text: "Don't Log out", style: 'cancel', onPress: () => {} },
             { text: 'Log out',
               style: 'destructive',
               onPress: async() => {
                await EncryptedStorage.clear();
                await rnBiometrics.deleteKeys();
                const { keysExist } = await rnBiometrics.biometricKeysExist()
                trasferKeys = await EncryptedStorage.getItem('transferKeys')
                if(keysExist === false && trasferKeys === null){
                    dispatch(userLogOut());
                    navigation.dispatch(e.data.action);
                }
               }
             }
            ]
        );
    })
    },[navigation]);


useEffect(() => {
    hasBioAuthSensor()
    dispatch(getAccounts())
},[isFocused])

useEffect(() => {
    if(toggleCheckBox){
        navigation.navigate('BiometricEnrollment');
    }
},[toggleCheckBox,showCheckbox])
    
const hasBioAuthSensor = async () => {
    try{
        const {available} = await rnBiometrics.isSensorAvailable()
        const { keysExist } = await rnBiometrics.biometricKeysExist()
        const transferKeys = await EncryptedStorage.getItem('transferKeys')
        if(available && !keysExist){
            setShowCheckbox(true)
            setToggleCheckBox(false)
        }else if(available && keysExist){
            setShowCheckbox(false)
        }
    }catch(error){
        console.log(error)
    }
}
    
const checkBoxOnhange = async(newValue)=>{
    setToggleCheckBox(newValue)
}

const addAccount = ()=>{
    navigation.navigate('AccountCrud')
}

const removeAccounts = ()=>{
    console.log('remove')
}

const options = ()=>{
    console.log('options')
}


    return (
        <View style={style.backgroundView}>
            <View style={style.headerContainer}>
                <Text style={style.titleText}>Accounts</Text>
                <Pressable onPress={removeAccounts} style={style.addButton}>
                    <Icon name='remove' size={40} color="white"/>
                </Pressable>
                <Pressable onPress={addAccount} style={style.deleteButton}>
                    <Icon name='add' size={40} color="white"/>
                </Pressable>
                <Pressable onPress={options} style={style.optionsButton}>
                    <Icon name='more-vert' size={40} color="white"/>
                </Pressable>
            </View>
            <View style={style.flatListContainer}>
                <FlatList
                    data={accounts}
                    renderItem={({item,index}) =>
                    <View style={style.itemView}>
                        <Text style={style.itemTextTitle}>{item.accountTitle}</Text>
                        <Text style={style.itemText}>{item.username}</Text>
                        {accounts.length -1 !== index && <View style={style.dividerContainer}>
                            <View style={style.divider}/>
                        </View>}
                    </View>
                    }
                    keyExtractor={account => account._id}
                />
            </View>
            
            {showCheckbox && 
                <TouchableOpacity style={style.bioAuthCheckbox} onPress={()=>checkBoxOnhange(!toggleCheckBox)}>
                    <CheckBox
                        disabled={false}
                        value={toggleCheckBox}
                        onValueChange={checkBoxOnhange}
                    />
                    <Text style={style.bioAuthCheckboxText}>Enable biometric authentication</Text>
                </TouchableOpacity>
            }
        {loading === 'LOADING' &&
            <View style={style.loadingContainer}>
                <ActivityIndicator size="large" color="#374FC6" />
            </View>}
        </View>
    );
}

const style = StyleSheet.create({
    backgroundView:{
        flex:1,
        backgroundColor: '#4996FA',
      },
    titleText:{
    fontSize:30,
    fontWeight:'bold',
    color:'white',
    },
    bioAuthCheckboxText:{
        fontSize:10,
        fontWeight:'bold',
        color:'white', 
    },
    bioAuthCheckbox:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    headerContainer:{
        flexDirection:'row',
        with:'100%',
        justifyContent:'space-around',
        paddingTop:'2%',
    },
    itemView:{
        backgroundColor:'white',
        paddingHorizontal:10,
    },
    itemTextTitle:{
        fontSize:20,
        fontWeight:'bold',
        color:'#4996FA',
    },
    itemText:{
        fontSize:15,
        fontWeight:'400',
        color:'#4996FA',
    },
    flatListContainer:{
        borderRadius:20,
        borderWidth:1,
        paddingVertical:8,
        marginTop:10,
        backgroundColor:'white',
        borderColor:'white',
        paddingHorizontal:5,
        height:'85%'
    },
    divider:{
        borderBottomWidth:1,
        borderBottomColor:'#BCBCBC'
    },
    dividerContainer:{
        paddingHorizontal:30,
        paddingTop:6
    },
    loadingContainer: {
        width: '100%',
        height: '100%',
        position:'absolute',
        justifyContent: 'center',
        backgroundColor:'#7F7F7F',
        opacity:0.7
      }
})

export default StartScreen;