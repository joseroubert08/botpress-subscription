import React from 'react'
import ReactDOM from 'react-dom'
import {
  Col,
  Button,
  Panel,
  Checkbox,
  Label,
  Alert,
  Row,
  ControlLabel,
  FormControl,
  Collapse,
  Form,
  FormGroup
} from 'react-bootstrap'
import Toggle from 'react-toggle'
import TagsInput from 'react-tagsinput'
import _ from 'lodash'
import Promise from 'bluebird'

import 'react-tagsinput/react-tagsinput.css'
import 'react-toggle/style.css'
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
    .then(() => this.resetSubscriptionHashes())
  }

  fetchConfig() {
    const { axios } = this.props.bp
    return axios.get(apiUrl('config'))
    .then(({data}) => this.setState({ config: data }))
    .catch(err => {
      this.setState({ error: 'An error occured' }) // TODO Change this
    })
    .then(() => this.resetConfigHash())
  }

  saveConfig() {
    const { axios } = this.props.bp
    return axios.post(apiUrl('config'), this.state.config)
    .catch(err => {
      this.setState({ error: 'An error occured' }) // TODO Change this
    })
    .then(::this.fetchConfig)
  }

  renderGlobalConfig() {
    const dirty = this.isConfigDirty()

    const footer = <div className="pull-right">
      <Button bsStyle="success" disabled={!dirty} onClick={::this.saveConfig}>
      Save</Button>
    </div>

    const update = property => value => {
      this.setState({
        config: Object.assign({}, this.state.config, { [property]: value })
      })
    }

    const { config } = this.state

    const updateKeywords = update('manage_keywords')
    const updateAction = event => update('manage_keywords')(event.target.value)
    const updateType = event => {
      update('manage_type')(event.target.checked ? 'javascript' : 'text')
    }
    const isToggled = config.manage_type === 'javascript'

    return <Panel header="Configuration" footer={footer}>
      <Form>
        <FormGroup>
          <ControlLabel>Manage keywords</ControlLabel>
          <TagsInput value={config.manage_keywords} onChange={updateKeywords} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Action type ({config.manage_type}) {' '}</ControlLabel>
          <Toggle className={style.toggle}
            defaultChecked={isToggled}
            onChange={updateType} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Subscribe action</ControlLabel>
          <FormControl componentClass="textarea" value={config.manage_action} onChange={updateAction}/>
        </FormGroup>
      </Form>
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
    const confirm = window.confirm('Deleting a subscription will also unsubscribe its users. This can\'t be undone. Continue ?')
    if (!confirm) {
      return
    }

    const { axios } = this.props.bp
    axios.delete(apiUrl('subscriptions/' + id))
    .then(::this.fetchSubscriptions) 
  }

  resetSubscriptionHashes() {
    const subHashes = this.state.subscriptions 
      && this.state.subscriptions.reduce((acc, sub) => {
        acc[sub.id] = JSON.stringify(sub)
        return acc
      }, {})

    this.setState({ subHashes })
  }

  resetConfigHash() {
    const configHash = JSON.stringify(this.state.config)
    this.setState({ configHash })
  }

  isConfigDirty() {
    return JSON.stringify(this.state.config) !== this.state.configHash
  }

  isSubscriptionDirty(id) {
    const sub = _.find(this.state.subscriptions, { id })
    return (sub && JSON.stringify(sub)) 
      !== (this.state.subHashes && this.state.subHashes[id])
  }

  save(id) {
    const { axios } = this.props.bp
    const sub = _.find(this.state.subscriptions, { id })
    axios.post(apiUrl('subscriptions/' + id), sub)
    .then(::this.fetchSubscriptions)
  }

  renderCreateNew() {
    return <Button bsStyle="primary" className="pull-right" 
      onClick={::this.createNew}>
      Create new
    </Button>
  }

  renderSingleSubscription(sub) {
    const dirty = this.isSubscriptionDirty(sub.id)

    const footer = <div className="pull-right">
      <Button bsStyle="default" onClick={() => this.delete(sub.id)}>Delete</Button>
      <Button bsStyle="success" 
        disabled={!dirty} 
        onClick={() => this.save(sub.id)}>Save</Button>
    </div>

    const header = <span className={style.subHeader}>
      <strong>{sub.category}</strong>
      {' (' + sub.count + ' subscribers)'}
    </span>

    const hChange = property => value => {
      let subscriptions = this.state.subscriptions.map(s => {
        if (s.id === sub.id) {
          s[property] = value
        }
        return s
      })
      this.setState({ subscriptions })
    }

    const hTextArea = property => event => {
      return hChange(property)(event.target.value) 
    }

    const hToggle = property => event => {
      return hChange(property)(event.target.checked ? 'javascript' : 'text')
    }

    const isToggled = property => sub[property] === 'javascript'

    const collapsed = this.state.selected === sub.id

    return <Panel collapsible={true} key={sub.id} header={header} footer={footer}>
      <div>
        <Form>
          <FormGroup>
            <ControlLabel>Subscribe keywords</ControlLabel>
            <TagsInput value={sub.sub_keywords} onChange={hChange('sub_keywords')} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Action type ({sub.sub_action_type}) {' '}</ControlLabel>
            <Toggle className={style.toggle}
              defaultChecked={isToggled('sub_action_type')}
              onChange={hToggle('sub_action_type')} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Subscribe action</ControlLabel>
            <FormControl componentClass="textarea" value={sub.sub_action} onChange={hTextArea('sub_action')}/>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Unsubscribe keywords</ControlLabel>
            <TagsInput value={sub.unsub_keywords} onChange={hChange('unsub_keywords')} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Action type ({sub.unsub_action_type}) {' '}</ControlLabel>
            <Toggle className={style.toggle}
              defaultChecked={isToggled('unsub_action_type')}
              onChange={hToggle('unsub_action_type')} />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Unsubscribe action</ControlLabel>
            <FormControl componentClass="textarea" value={sub.unsub_action} onChange={hTextArea('unsub_action')}/>
          </FormGroup>
        </Form>
      </div>
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
