// Write your code here
import {Component} from 'react'
import {BsDashSquare, BsPlusSquare} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'INPROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class ProductItemDetails extends Component {
  state = {
    productDetailsList: {},
    similarProductList: [],
    quantity: 1,
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProductDetailsList()
  }

  getFormattedData = data => ({
    id: data.id,
    price: data.price,
    rating: data.rating,
    totalReviews: data.total_reviews,
    description: data.description,
    imageUrl: data.image_url,
    available: data.availability,
    brand: data.brand,
    title: data.title,
  })

  getProductDetailsList = async () => {
    // console.log(this.props)
    const {match} = this.props
    const {params} = match
    const {id} = params
    // console.log(id)
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const productDetailsApiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(productDetailsApiUrl, options)
    if (response.ok === true) {
      const fetchedData = await response.json()
      const updatedData = this.getFormattedData(fetchedData)
      const updatedSimilarProductData = fetchedData.similar_products.map(
        eachSimilarProduct => this.getFormattedData(eachSimilarProduct),
      )
      this.setState({
        productDetailsList: updatedData,
        similarProductList: updatedSimilarProductData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onDecrement = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onIncrement = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  renderLoadingView = () => (
    <div className="loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderProductDetailsView = () => {
    const {productDetailsList, similarProductList, quantity} = this.state
    const {
      imageUrl,
      title,
      rating,
      totalReviews,
      brand,
      price,
      description,
      available,
    } = productDetailsList

    return (
      <div className="product-item-details-container">
        <div className="detail-view-container">
          <img src={imageUrl} alt="product" className="product-details-image" />
          <div className="product-details-container">
            <h1 className="detail-img-title">{title}</h1>
            <p className="details-view-price">Rs {price}/-</p>
            <div className="review-rating-container">
              <button type="button" className="rating-btn">
                <p className="detail-view-rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star-img"
                />
              </button>
              <p className="detail-view-reviews">{totalReviews} Reviews</p>
            </div>
            <p className="detail-view-description">{description}</p>
            <div className="label-value-container">
              <p className="product-available">Available:</p>
              <p className="available-span">{available}</p>
            </div>
            <div className="label-value-container">
              <p className="product-brand">Brand:</p>
              <p className="brand-span">{brand}</p>
            </div>
            <hr className="hr-line" />
            <div className="quantity-container">
              <button
                type="button"
                className="quantity-controller-button"
                onClick={this.onDecrement}
                // testid="minus"
              >
                <BsDashSquare className="quantity-controller-icon" />
              </button>
              <p className="product-quantity">{quantity}</p>
              <button
                type="button"
                className="quantity-controller-button"
                onClick={this.onIncrement}
                // testid="plus"
              >
                <BsPlusSquare className="quantity-controller-icon" />
              </button>
            </div>
            <button type="button" className="add-cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul className="similar-product-list">
          {similarProductList.map(eachSimilarProduct => (
            <SimilarProductItem
              key={eachSimilarProduct.id}
              similarProductDetails={eachSimilarProduct}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderFailureView = () => (
    <div className="product-details-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="product-detail-failure-img"
      />
      <h1 className="product-detail-not-found-heading">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="product-detail-continue-shopping-btn">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  renderProductDetailsViewListByApiStatus = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductDetailsView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()

      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-item-details-bg-container">
          {this.renderProductDetailsViewListByApiStatus()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails
