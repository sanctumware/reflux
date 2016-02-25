/** @flow */

const API = require('./API');
const Button = require('./Button');
const Colors = require('./Colors');
const PureRender = require('./PureRender');
const {Component} = require('react');

@PureRender
class LoginModal extends Component {
  _onLoginClick = () => {
    API.login();
  };

  render(): any {
    return (
      <div style={styles.overlay}>
        <div style={styles.dialog}>
          <h1 style={styles.title}>
            &#9993; reflux
          </h1>
          <p style={styles.description}>
            reflux is based on NuclearMail - as an experiment of writing a webmail client using React
            and the Flux architecture. It runs completely in the browser and
            uses the Gmail REST API.
          </p>
          <Button onClick={this._onLoginClick}>
            Login with Google
          </Button>
        </div>
      </div>
    );
  }
}

const styles = {
  overlay: {
    background: 'rgba(255, 255, 255, .9)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  dialog: {
    background: 'white',
    boxShadow: '0 0 20px 0 rgba(0, 0, 0, .5)',
    left: '50%',
    padding: '40px',
    position: 'absolute',
    textAlign: 'center',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
  },

  title: {
    color: Colors.accent,
    fontSize: '24px',
    marginBottom: '24px',
  },

  description: {
    marginBottom: '24px',
  },
};

module.exports = LoginModal;
