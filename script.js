@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

:root {
    --bg: #f4f7f6;
    --text: #2c3e50;
    --green: #7fb394;
    --blue: #70a1ff;
    --orange: #f39c12;
    --red: #e74c3c;
    --white: #ffffff;
}

body {
    font-family: 'Roboto', sans-serif;
    background-color: var(--bg);
    color: var(--text);
    margin: 0;
    font-size: 18px;
}

.tab-bar {
    display: flex;
    background: var(--white);
    position: sticky;
    top: 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 100;
}

.tab-bar button {
    flex: 1;
    padding: 20px;
    border: none;
    background: none;
    font-size: 1rem;
    font-weight: bold;
    color: #95a5a6;
    cursor: pointer;
}

.tab-bar button.active {
    color: var(--green);
    border-bottom: 4px solid var(--green);
}

main { max-width: 600px; margin: 20px auto; padding: 15px; }

.card {
    background: var(--white);
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

input[type="text"] {
    width: 100%;
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 1.1rem;
    box-sizing: border-box;
}

button#btn-analizza {
    width: 100%;
    background-color: var(--green);
    color: white;
    border: none;
    padding: 15px;
    border-radius: 10px;
    margin-top: 10px;
    font-weight: bold;
}

.alert-box {
    background: #fff3cd;
    border-left: 5px solid var(--orange);
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
}

.fibre-tag { color: #27ae60; font-weight: bold; }
.hidden { display: none; }
.btn-save { background: var(--blue); color: white; width: 100%; padding: 15px; border-radius: 10px; border: none; font-weight: bold; }
