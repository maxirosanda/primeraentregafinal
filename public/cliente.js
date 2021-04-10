
const socket = io(); 
const fecha = new Date();

const enviarMensaje = () =>{
    let paquete = { mail: document.getElementById("mail").value,
     mensaje: document.getElementById("mensaje").value,
     fecha: `${fecha.getDay()}/${fecha.getMonth()}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()} `
}
    socket.emit('paquete', paquete)
} 
socket.on('vermensajes', data => {
    
    let texto =""
    data.forEach((el,index) =>{
      texto += `<li class="list-group-item"> Mail : ${el.mail} mensaje ${el.mensaje} fecha ${el.fecha} </li>`    
   })
   document.getElementById("contenedordatos").innerHTML=texto

})

socket.on('lista', data => {
    let texto =`<div class="col-6">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Nombre</th>
          <th scope="col">Precio</th>
          <th scope="col">Imagen</th>
        </tr>
      </thead>
      <tbody>`
    data.forEach((el,index) =>{
      texto += `<tr>
      <th scope="row"> ${el.id}</th>
      <td>${el.title}</td>
      <td>${el.price}</td>
      <td><img src="${el.thumbnail}" class="img-fluid" alt="Responsive image"></td>
    </tr>`    
   })
   texto +=`  </tbody>
   </table>
   </div>` 
   document.getElementById("contenedordatos2").innerHTML=texto
  
})







