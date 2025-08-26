import React from 'react'
import { Spinner } from 'react-bootstrap'
function Loader() {
  return (
    <Spinner animation="border" variant="primary" role='status' style={{ height: '80px', width: '80px', margin: 'auto', display: 'block' }} />
  )
}

export default Loader