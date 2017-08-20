/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
} from 'react-native';

import codePush from 'react-native-code-push'

let MyApp = class extends Component {
    state: Object

    constructor() {
        super(...arguments)

        this.state = {
            hasCheckUpdate: false,
            remotePackage: null,
            hasGetLocalPackage: false,
            localPackage: null, 
            hasDownloadedPackage: false,
            downloadPackage: null,
        }
    }

    componentDidMount() {
        codePush.notifyAppReady()
    }

    //存在版本差异
    _handleBinaryVersionMismatchCallback = (update) => {
        codePush.getCurrentPackage()
        .then((localPackage) => {
            console.log('localPackage:')
            console.log(localPackage)
            console.log('update:')
            console.log(update)
            this.setState({localPackage, remotePackage: update, hasGetLocalPackage: true})
        })
        .catch((error) => {
            console.log('get current package error')
        })
    }

    //确保checkUpdate在同一时间只执行一次
    _checkUpdate = (() => {
        let checking = false
        const checkComplete = () => checking = false
        return () => {
            if(checking) return 

            checking = true
            codePush.checkForUpdate(
                'hhohGy3xInM_UYNnRCt6dKDJpYIN9f13be1d-e5b1-4c9b-89ba-b6945f2bed88', 
                this._handleBinaryVersionMismatchCallback
            )
            .then((remotePackage) => {
                if(remotePackage) {
                    console.log('remotePackage:')
                    console.log(remotePackage)
                    Alert.alert('温馨提示', '检查到有可用的更新包')
                    this.setState({remotePackage, hasCheckUpdate: true})
                } else {
                    this.setState({hasCheckUpdate: true})
                    Alert.alert('温馨提示', '没有检查到可用的更新包')
                }
                checkComplete()
            })
            .catch((error) => {
                console.log(`check update get error`)
                checkComplete()
            })
        }
    })()

    //监听下载进度
    _downloadProgressCallback = (event) => {
        console.log('download: ')
        console.log(event)
    }
    //确保download同一时间只执行一次
    _downLoadFromRemote = (() => {
        let downloading = false
        const downloadComplete = () => downloading = false
        return () => {
            if(!this.state.remotePackage) {
                if(this.state.hasCheckUpdate) {
                    Alert.alert('温馨提示', '服务器没有可用的更新包')
                } else {
                    Alert.alert('温馨提示', '请先check update')
                }
                return 
            }

            if(downloading) return
                
            downloading = true
            this.state.remotePackage.download(this._downloadProgressCallback)
            .then((downloadPackage) => {
                this.setState({hasDownloadedPackage: true, downloadPackage})
                downloadComplete()
                Alert.alert('温馨提示', '成功下载更新包')
            })
            .catch((error) => {
                Alert.alert('温馨提示', '下载更新包失败')
                downloadComplete()
            })
        }
    })()

    //安装成功回调
    _updatedInstalledCallback = () => {
        console.log('native installed success')
    }
    //确保install同一时间只执行一次
    _installPackage = (installMode, minimumBackgroundDuration=0) => {
        let installing = false
        const installComplete = () => installing = false
        return () => {
            if(!this.state.hasDownloadedPackage) {
                Alert.alert('温馨提示', '本地没有下载好的更新包')
                return 
            }
                
            installing = true
            this.state.downloadPackage.install(
                installMode, 
                minimumBackgroundDuration, 
                this._updatedInstalledCallback
            )
            .then(() => {
                Alert.alert('温馨提示', '安装更新包成功')
            })
            .catch((error) => {
                console.log('installed error')
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    发布V3更新包
                </Text>
                <TouchableOpacity onPress={this._checkUpdate}>
                    <Text>Check update</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._downLoadFromRemote}>
                    <Text>Download from remote</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._installPackage(codePush.InstallMode.ON_NEXT_RESTART)}>
                    <Text>Install OnNextRestart</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._installPackage(codePush.InstallMode.ON_NEXT_RESUME)}>
                    <Text>Install OnNextResume</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this._installPackage(codePush.InstallMode.IMMEDIATE)}>
                    <Text>Install Immediate</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

AppRegistry.registerComponent('MyApp', () => MyApp);
