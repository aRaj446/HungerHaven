import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';

export default function MyOrder() {
    const [orderData, setOrderData] = useState(null)

    const fetchMyOrder = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/myOrderData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: localStorage.getItem('userEmail')
                })
            })
            const response = await res.json()
            setOrderData(response.orderData)
        } catch (error) {
            console.error('Failed to fetch orders:', error.message)
        }
    }

    useEffect(() => {
        fetchMyOrder()
    }, [])

    // order_data is an array of [items[], orderDateString] pairs, newest first.
    const orderBatches = orderData?.order_data ? [...orderData.order_data].reverse() : []

    return (
        <div>
            <div>
                <Navbar />
            </div>

            <div className='container'>
                <div className='row'>
                    {orderBatches.length === 0 && <div className='m-5 w-100 text-center fs-3'>No orders yet.</div>}
                    {orderBatches.map((batch, batchIndex) => {
                        const items = batch[0] || []
                        const orderDate = batch[1]
                        return (
                            <div key={batchIndex}>
                                {orderDate && (
                                    <div className='m-auto mt-5'>
                                        {orderDate}
                                        <hr />
                                    </div>
                                )}
                                <div className='row'>
                                    {items.map((item) => (
                                        <div className='col-12 col-md-6 col-lg-3' key={item.id + '-' + item.size}>
                                            <div className="card mt-3" style={{ width: "16rem", maxHeight: "360px" }}>
                                                <img src={item.img} className="card-img-top" alt={item.name} style={{ height: "120px", objectFit: "fill" }} />
                                                <div className="card-body">
                                                    <h5 className="card-title">{item.name}</h5>
                                                    <div className='container w-100 p-0' style={{ height: "38px" }}>
                                                        <span className='m-1'>{item.qty}</span>
                                                        <span className='m-1'>{item.size}</span>
                                                        <div className='d-inline ms-2 h-100 w-20 fs-5'>
                                                            ₹{item.price}/-
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Footer />
        </div>
    )
}
