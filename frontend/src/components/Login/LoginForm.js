import { useState } from 'react';

function LoginForm(props) {
    const [password, setPassword] = useState('');

    const sendPassword = () => {
        setPassword('')
        props.verifyPassword(password)
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            sendPassword()
        }
      }
  
    return (
        <div id='loginPage'>
        <div className='loginForm'>
            Enter key...<br/>
            <input type='password' value={password} onKeyDown={handleKeyDown} onChange={(e)=>setPassword(e.target.value)}/>
            <div type='button' className='waves-effect waves-light btn' onClick={sendPassword}>Login</div>
        </div>
        </div>
    );
}

export default LoginForm;