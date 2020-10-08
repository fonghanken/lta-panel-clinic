import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking } from 'react-native';
import { Icon } from 'react-native-elements';

export default class ClinicInfoPanel extends Component {
	
	getDayOfWeek() {
		const d = new Date();
		return d.getDay();
	}
	
	formatTime(time) {
		const hr = parseInt(time / 100);
		const min = time - (hr * 100);
		const pm = (hr >= 12);
		return '' + (pm ? (hr === 12 ? 12 : hr - 12) : hr) + ':' + (min > 9 ? min : '0' + min) + (pm ? 'pm' : 'am');
	}
	
	render() {
		return (this.props.clinic !== null &&
		<ScrollView style={styles.container}>
			<Text style={{fontWeight: '700', marginBottom: 10}}>{this.props.clinic.name}</Text>
			<Text style={{marginBottom: 10}}>{this.props.clinic.address}</Text>
			<View style={{flexDirection: 'row'}}>
				<View style={{flex: 1}}>
					<Text style={{fontWeight: '700', marginBottom: 10}}>Today’s opening times</Text>
					{this.props.clinic.openings[this.getDayOfWeek()].length === 0 ? <Text>closed today</Text> : this.props.clinic.openings[this.getDayOfWeek()].map(openingTime => (
					<Text>{this.formatTime(parseInt(openingTime.o))} - {this.formatTime(parseInt(openingTime.c))}</Text>
					))}
				</View>
				<View>
					<Icon
						reverse
						raised
						name='directions'
						type='MaterialIcons'
						size={30}
						color='#4169e1'
						onPress = {(e) => {
							Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + this.props.clinic.coordinate.latitude + ',' + this.props.clinic.coordinate.longitude);
						}}
					/>
				</View>
			</View>
		</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 10
	}
});