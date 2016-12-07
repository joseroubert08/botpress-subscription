import React from 'react'
import ReactDOM from 'react-dom'
import {
  Col,
  Button,
  Panel,
  Checkbox,
  Label,
  Alert,
  Row
} from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'

import style from './style.scss'

const apiUrl = url => '/api/botpress-subscription/' + url

export default class SubscriptionModule extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      subscriptions: [],
      config: null,
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    this.reloadAll()
  }

  reloadAll() {
    this.setState({ loading: true })
    this.fetchConfig()
    .then(() => this.fetchSubscriptions())
    .then(() => this.setState({ loading: false }))
  }

  fetchSubscriptions() {
    const { axios } = this.props.bp
    return axios.get(apiUrl('subscriptions'))
    .then(({data}) => this.setState({ subscriptions: data }))
    .catch(err => {
      this.setState({ error: 'An error occured' }) // TODO Change this
    })
  }

  fetchConfig() {
    const { axios } = this.props.bp
    return axios.get(apiUrl('config'))
    .then(({data}) => this.setState({ config: data }))
    .catch(err => {
      this.setState({ error: 'An error occured' }) // TODO Change this
    })
  }

  renderGlobalConfig() {
    const footer = <div className="pull-right">
      <Button bsStyle="success">Save</Button>
    </div>

    return <Panel header="Configuration" footer={footer}>
      Config goes here
    </Panel>
  }

  createNew() {
    // TODO Change this to a beautiful popup
    const category = window.prompt('Please input the category name of the subscription')

    const { axios } = this.props.bp
    axios.put(apiUrl('subscriptions/' + category))
    .then(::this.fetchSubscriptions)
  }

  delete(id) {
    const { axios } = this.props.bp
    axios.delete(apiUrl('subscriptions/' + id))
    .then(::this.fetchSubscriptions) 
  }

  renderCreateNew() {
    return <Button bsStyle="primary" className="pull-right" 
      onClick={::this.createNew}>
      Create new
    </Button>
  }

  renderSingleSubscription(sub) {
    const footer = <div className="pull-right">
      <Button bsStyle="danger" onClick={() => this.delete(sub.id)}>Delete</Button>
      <Button bsStyle="success">Save</Button>
    </div>

    return <Panel key={sub.id} header={sub.category} footer={footer}>
      Content goes here
    </Panel>
  }

  renderAllSubscriptions() {
    const { subscriptions } = this.state

    if (!subscriptions.length) {
      return <h3 className={style.center}>There are no subscriptions</h3>
    }

    return subscriptions.map(::this.renderSingleSubscription)
  }

  renderLoading() {
    return <h1>Loading...</h1>
  }

  renderError() {
    return <Panel header='Error' bsStyle='danger'>
      {this.state.error}
    </Panel>
  }

  render() {
    const { error, loading } = this.state

    if (loading) {
      return this.renderLoading()
    }

    return <div className={style.subscriptions}>
      {error && this.renderError()}
      <Row>
        <Col md={12}>{this.renderCreateNew()}</Col>
      </Row>
      <Row>
        <Col mdOffset={2} md={8}>{::this.renderGlobalConfig()}</Col>
      </Row>
      <Row>
        <Col mdOffset={2} md={8}>{::this.renderAllSubscriptions()}</Col>
      </Row>
    </div>
  }
}
