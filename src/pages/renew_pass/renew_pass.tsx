function Renew() {
    return (
        <>
          <div className="app-page">
            <div id='root'>
              <div className="card">
                <h1>Circle</h1>
                <h2>Password reset</h2><br/>
                <form>
                  <input type="password" placeholder="Password" required/><br/><br/>
                  <input type="password" placeholder="Confirm New Password" required/><br/><br/>
                  <button type="submit">Create New Password</button><br/><br/>
                </form>
              </div>
            </div>
          </div>
          
        </>
    );
}

export default Renew;