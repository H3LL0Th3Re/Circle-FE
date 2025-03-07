import { Link } from 'react-router-dom';
function Forgot() {
    return (
        <>
          <div className='app-page'>
            <div id='root'>
              <div className="card">
                <h1>Circle</h1>
                <h2>Forgot password</h2><br/>
                <form>
                  <input type="email" placeholder="Email" required/><br/><br/>
                  <button type="submit">Send Instruction</button><br/><br/>
                </form>
                <div className="form-footer">
                  Already have account? <Link to="/login" className="text-green-500">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </>
    );
}

export default Forgot;
