import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {urlConfig} from '../../config';
import './SearchPage.css';

function SearchPage() {

    //Task 1: Define state variables for the search query, age range, and search results.
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [ageRange, setAgeRange] = useState(10);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    useEffect(() => {
        // fetch all products initially
        const fetchProducts = async () => {
            try {
                let url = `${urlConfig.backendUrl}/api/gifts`
                console.log(url)
                const response = await fetch(url);
                if (!response.ok) {
                    //something went wrong
                    throw new Error(`HTTP error; ${response.status}`)
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);


    // Task 2. Fetch search results from the API based on user inputs.
    const handleSearch = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            if (searchQuery.trim()) {
                queryParams.append('name', searchQuery.trim());
            }
            if (selectedCategory) {
                queryParams.append('category', selectedCategory);
            }
            if (selectedCondition) {
                queryParams.append('condition', selectedCondition);
            }
            if (ageRange) {
                queryParams.append('age_years', ageRange.toString());
            }

            const url = `${urlConfig.backendUrl}/api/search?${queryParams.toString()}`;
            console.log('Search URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error; ${response.status}`);
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.log('Search error: ' + error.message);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const goToDetailsPage = (productId) => {
        // Task 6. Enable navigation to the details page of a selected gift.
        navigate(`/details/${productId}`);
    };




    return (
        <div className="search-page-container">
            <div className="container">
                <div className="search-page-content">
                    <h2 className="page-title">Find Your Perfect Gift</h2>
                    
                    {/* Task 7: Add text input field for search criteria*/}
                    <div className="search-section mb-4">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Search for gifts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {/* Task 8: Implement search button with onClick event to trigger search:*/}
                            <button 
                                className="btn btn-primary search-button" 
                                type="button"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h5>Filter Your Search</h5>
                        <div className="row">
                            {/* Task 3: Dynamically generate category and condition dropdown options.*/}
                            <div className="col-md-4 mb-3">
                                <div className="filter-group">
                                    <label htmlFor="categorySelect" className="form-label">Category</label>
                                    <select 
                                        id="categorySelect"
                                        className="form-select dropdown-filter"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-md-4 mb-3">
                                <div className="filter-group">
                                    <label htmlFor="conditionSelect" className="form-label">Condition</label>
                                    <select 
                                        id="conditionSelect"
                                        className="form-select dropdown-filter"
                                        value={selectedCondition}
                                        onChange={(e) => setSelectedCondition(e.target.value)}
                                    >
                                        <option value="">All Conditions</option>
                                        {conditions.map((condition) => (
                                            <option key={condition} value={condition}>
                                                {condition}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Task 4: Implement an age range slider and display the selected value. */}
                            <div className="col-md-4 mb-3">
                                <div className="filter-group">
                                    <label htmlFor="ageRange" className="form-label">
                                        Maximum Age
                                    </label>
                                    <div className="age-range-container">
                                        <input
                                            type="range"
                                            className="form-range age-range-slider"
                                            id="ageRange"
                                            min="1"
                                            max="20"
                                            value={ageRange}
                                            onChange={(e) => setAgeRange(parseInt(e.target.value))}
                                            style={{'--value': `${(ageRange / 20) * 100}%`}}
                                        />
                                        <div className="age-range-value">{ageRange} years</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*Task 5: Display search results and handle empty results with a message. */}
                    <div className="search-results">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5>Search Results</h5>
                            <div className="search-stats">
                                Found {searchResults.length} gift{searchResults.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        
                        {loading ? (
                            <div className="loading-spinner">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2">Searching for gifts...</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="no-products-alert">
                                <i className="fas fa-search"></i>
                                No gifts found matching your criteria.<br/>
                                <small>Try adjusting your search filters or search terms.</small>
                            </div>
                        ) : (
                            <div className="search-results-container">
                                {searchResults.map((gift) => (
                                    <div key={gift._id} className="search-results-card" onClick={() => goToDetailsPage(gift._id)}>
                                        <div className="card-img-container">
                                            {gift.image ? (
                                                <img 
                                                    src={`/images/${gift.image}`} 
                                                    className="card-img-top" 
                                                    alt={gift.name}
                                                />
                                            ) : (
                                                <div className="no-image-placeholder">
                                                    📦 No Image Available
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title">{gift.name}</h6>
                                            <p className="card-text">
                                                {gift.description?.substring(0, 100)}
                                                {gift.description?.length > 100 ? '...' : ''}
                                            </p>
                                        </div>
                                        <div className="card-footer">
                                            <span className="gift-condition">{gift.condition}</span>
                                            <span className="gift-age">{gift.age} years old</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
