import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { Icon, Header } from 'react-native-elements';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import ClinicInfoPanel from './components/ClinicInfoPanel.js'
import CLINICS from './clinics.json';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const ASPECT_RATIO = screenWidth / screenHeight;
const INIT_LATITUDE_DELTA = 0.4;
const INIT_LONGITUDE_DELTA = INIT_LATITUDE_DELTA * ASPECT_RATIO;
const homeRegion = {
	latitude: 1.3521,
	longitude: 103.8198,
	latitudeDelta: INIT_LATITUDE_DELTA,
	longitudeDelta: INIT_LONGITUDE_DELTA
};

export default class App extends Component {
	
	state = {
		selectedClinic: null,
		searchBarShow: false
	};

	componentDidMount(){
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.setState({
					currRegion: {
						latitude: parseFloat(position.coords.latitude),
						longitude: parseFloat(position.coords.longitude),
						latitudeDelta: INIT_LATITUDE_DELTA / 10,
						longitudeDelta: INIT_LONGITUDE_DELTA / 10
					}
				});
			},
			(error) => console.log(error.message),
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
		);
	}

	componentWillUnmount(){
		navigator.geolocation.clearWatch(this.watchID);
	}
	
	isClinicOpen(openings){
		d = new Date();
		let open = false;
		openings[d.getDay()].forEach(function(v){
			opening = parseInt(v.o);
			closing = parseInt(v.c);
			let now = d.getHours() * 100 + d.getMinutes();
			if(now >= opening && now <= closing) open = true;
		});
		return open;
	}
	
	getClinicData(key){
		return CLINICS.list.filter(e => e.key === key)[0];
	}

	render() {
		return (
			<View style={styles.container}>
				<Header
					centerComponent={{
						text: 'LTA Panel Clinics',
						style: { color: '#FFF', fontSize: 20, fontWeight: 'bold' }
					}}
					rightComponent={{
						icon: 'search',
						color: '#fff',
						onPress: () => {this.setState({searchBarShow: !this.state.searchBarShow})}
					}}
				/>
				{this.state.searchBarShow &&
				<GooglePlacesAutocomplete
					styles={autoCompleteStyles}
					placeholder="Type to search..."
					fetchDetails
					onPress={(data, details = null) => {
						this.setState({selectedClinic: null});
						this._map.animateToRegion({
							latitude: details.geometry.location.lat,
							longitude: details.geometry.location.lng,
							latitudeDelta: INIT_LATITUDE_DELTA / 10,
							longitudeDelta: INIT_LONGITUDE_DELTA / 10
						});
					}}
					query={{
						// available options: https://developers.google.com/places/web-service/autocomplete
						key: 'AIzaSyA0bvbZs7U03T9VMpsCdop9PQUN8e-iV3A',
						language: 'en', // language of the results
						components: 'country:sg'
					}}
				/>
				}
				<View style={styles.mapContainer}>
					<MapView
						ref={c => {this._map = c;}}
						style={styles.map}
						initialRegion={this.state.currRegion}
						showsUserLocation
						scrollEnabled
						zoomEnabled
						onPress = {(e) => {
							if(e.nativeEvent.id === undefined){
								this.setState({selectedClinic: null});
							}
						}}
					>
						{/*this.state.searchMarker.key !== null &&
						<MapView.Marker
							key={this.state.searchMarker.key}
							identifier={this.state.searchMarker.key}
							title={this.state.searchMarker.title}
							description={this.state.searchMarker.description}
							coordinate={this.state.searchMarker.coordinate}
						/>
						*/}
						
						{CLINICS.list.map(clinic => (
							<MapView.Marker
								key={clinic.key}
								identifier={clinic.key}
								coordinate={clinic.coordinate}
								onPress={() => {
									this._map.animateToRegion({
									latitude: clinic.coordinate.latitude,
									longitude: clinic.coordinate.longitude,
									latitudeDelta: INIT_LATITUDE_DELTA / 10,
									longitudeDelta: INIT_LONGITUDE_DELTA / 10
									});
									this.setState({selectedClinic: this.getClinicData(clinic.key)});
								}}
							>
								<Icon
									name='local-hospital'
									type='MaterialIcons'
									color={this.isClinicOpen(clinic.openings) ? '#009900' : '#990000'}
									size={30}
								/>
							</MapView.Marker>
						))}
					</MapView>
					<TouchableOpacity
						style={[styles.mapBtn, styles.btnHomeRegion]}
						onPress={() => {
							this.setState({selectedClinic: null});
							this._map.animateToRegion(homeRegion);
						}}
					>
						<Icon
							name='home'
							style={styles.icon}
							size={20}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.mapBtn, styles.btnZoomToUser]}
						onPress={()=>{
							navigator.geolocation.getCurrentPosition(
								(position) => {
									this.setState({selectedClinic: null});
									this._map.animateToRegion({
										latitude: parseFloat(position.coords.latitude),
										longitude: parseFloat(position.coords.longitude),
										latitudeDelta: INIT_LATITUDE_DELTA / 10,
										longitudeDelta: INIT_LONGITUDE_DELTA / 10
									});
								},
								(error) => console.log(error.message),
								{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
							);
						}}
					>
						<Icon
							name='location-arrow'
							type='font-awesome'
							style={styles.icon}
							size={20}
						/>
					</TouchableOpacity>
				</View>
				<ClinicInfoPanel clinic={this.state.selectedClinic} />
				{this.state.selectedClinic === null &&
				<View style={styles.legend}>
					<Icon name='local-hospital' type='MaterialIcons' color={'#009900'} size={30} />
					<Text>Open now</Text>
					<Icon name='local-hospital' type='MaterialIcons' color={'#990000'} size={30} />
					<Text>Closed now</Text>
				</View>
				}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5FCFF'
	},
	mapContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF'
	},
	map: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0
	},
	mapBtn: {
		backgroundColor: '#ddd',
		alignItems: 'center',
		justifyContent: 'center',
		width: 40,
		height: 40
	},
	btnHomeRegion: {
		position: 'absolute',
		top: 10,
		right: 10
	},
	btnZoomToUser: {
		position: 'absolute',
		top: 60,
		right: 10
	},
	legend: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 50
	}
});

const autoCompleteStyles = {
	container: {
		flex: 0,
	},
	textInputContainer: {
		backgroundColor: '#476DC5'
	},
	textInput: {
		fontSize: 15,
		lineHeight: 22.5,
		paddingTop: 0,
		paddingBottom: 0,
		color: '#476DC5',
		flex: 1
	},
	description: {
		color: '#476DC5'
	}
};