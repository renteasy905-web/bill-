import React from 'react'


import Cart from './Pages/Cart'
import CreateCustomer from './Pages/CreateCustomer'
import Sales from './Pages/Sale'
import CreateProducts from './Pages/CreateProducts'
import Allrproducts from './Pages/Allproducts'
import ListofSales from './Pages/ListofSales'
import { Route, Routes } from 'react-router-dom'
import First from './Pages/First'
import EditSale from './Pages/Editsales'


const App = () => {
  return (


    <div>

      <Routes>
        <Route path='/' element={<First/>} />
        <Route path='/createProducts' element={<CreateProducts/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/createCustomer' element={<CreateCustomer/>} />
        <Route path='/sales' element={<Sales/>} />
        <Route path='/allproducts' element={<Allrproducts/>} />
        <Route path='/allsales' element={<ListofSales/>} />
        <Route path='/editsales/:id' element={<EditSale/>} />



        
      </Routes>
     
    
      
    </div>
  )
}

export default App