async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8080/api/sessions/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Datos de inicio de sesión:', data);
            if (data.token) { 
                localStorage.setItem('token', data.token);
                console.log('Token almacenado:', data.token);
                window.location.href = '/home';
            } else {
                console.error('No se recibió token en la respuesta');
            }
        } else {
            const errorData = await response.json();
            console.error('Error al iniciar sesión:', errorData.message);
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('Error al comunicarse con el servidor.');
    }
}

document.getElementById('login-button').addEventListener('click', login);
