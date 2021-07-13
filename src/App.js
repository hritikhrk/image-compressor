import React from 'react'
import './App.css'
import imageCompression from 'browser-image-compression'

export default class App extends React.Component {
  constructor (...args) {
    super(...args)
    this.compressImage = this.compressImage.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      name: '',
      maxSizeMB: 0.7,
      maxWidthOrHeight: 1024,
      webWorker: {
        progress: null,
        inputSize: null,
        outputSize: null,
        inputUrl: null,
        outputUrl: null
      }
    }
  }

  handleChange (target) {
    return (e) => {
      this.setState({ [target]: e.currentTarget.value })
    }
  }

  onProgress (p) {
    const targetName = 'webWorker'
    this.setState(prevState => ({
      ...prevState,
      [targetName]: {
        ...prevState[targetName],
        progress: p
      }
    }))
  }

  async compressImage (event) {
    const file = event.target.files[0]
    this.state.name = file.name
    console.log('input', file)
    console.log(
      'ExifOrientation',
      await imageCompression.getExifOrientation(file)
    )
    const targetName = 'webWorker'
    this.setState(prevState => ({
      ...prevState,
      [targetName]: {
        ...prevState[targetName],
        inputSize: (file.size / 1024 / 1024).toFixed(2),
        inputUrl: URL.createObjectURL(file)
      }
    }))
    var options = {
      maxSizeMB: this.state.maxSizeMB,
      maxWidthOrHeight: this.state.maxWidthOrHeight,
      onProgress: p => this.onProgress(p)
    }
    const output = await imageCompression(file, options)
    console.log('output', output)
    this.setState(prevState => ({
      ...prevState,
      [targetName]: {
        ...prevState[targetName],
        outputSize: (output.size / 1024 / 1024).toFixed(2),
        outputUrl: URL.createObjectURL(output)
      }
    }))
  }

  render () {
    const { webWorker, maxSizeMB, maxWidthOrHeight } = this.state
    return (
      <div className="App">
        <div>
          Options:<br />
          <label htmlFor="maxSizeMB">maxSizeMB: <input type="number" id="maxSizeMB" name="maxSizeMB"
                                                       value={maxSizeMB}
                                                       onChange={this.handleChange('maxSizeMB')} /></label><br />
          <label htmlFor="maxWidthOrHeight">maxWidthOrHeight: <input type="number" id="maxWidthOrHeight"
                                                                     name="maxWidthOrHeight"
                                                                     value={maxWidthOrHeight}
                                                                     onChange={this.handleChange('maxWidthOrHeight')} /></label>
          <hr />
          <label htmlFor="web-worker">
            Compress in web-worker{' '}
            {webWorker.progress && <span>{webWorker.progress} %</span>}
            <input
              id="web-worker"
              type="file"
              accept="image/*"
              onChange={e => this.compressImage(e, true)}
            />
          </label>
          <p>
            {webWorker.inputSize && (
              <span>Source image size: {webWorker.inputSize} mb</span>
            )}
            {webWorker.outputSize && (
              <span>, Output image size: {webWorker.outputSize}</span>
            )}
          </p>
          {webWorker.outputUrl ? <p><a href={webWorker.outputUrl} download={this.state.name}>Download-compressed-image</a></p> : null}
        </div>
        {(webWorker.inputUrl) && (
          <table>
            <thead>
            <tr>
              <td>input preview</td>
              <td>output preview</td>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td><img src={webWorker.inputUrl} alt="input" /></td>
              <td><img src={webWorker.outputUrl} alt="output" /></td>
            </tr>
            </tbody>
          </table>
        )}
      </div>
    )
  }
};