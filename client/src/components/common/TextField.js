import React from 'react'
import classnames from 'classnames';
import PropTypes from 'prop-types';

function TextField({
    name,
    placeholder,
    value,
    error,
    info,
    type,
    onChange,
    disabled,
    readOnly
}) {

    return (
        <div className="form-group">
            <input 
            type={type}
            className={classnames('form-control form-control-lg', {
            'is-invalid': error
            })}
            placeholder={placeholder}
            name={name}
            value={value} 
            onChange={onChange} 
            disabled={disabled}
            readOnly={readOnly}
            />
            {info && <small className="form-text text-muted">{info}</small>}
            {error && (
            <div className="invalid-feedback">{error}</div>
            )}
        </div>
    )
}

TextField.propTypes = {
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string.isRequired,
    info: PropTypes.string,
    error: PropTypes.string,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.string,
    readOnly: PropTypes.bool
}

TextField.defaultProps = {
    type: 'text'
}

export default TextField
