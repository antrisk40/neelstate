import React from "react";

export default function CreateListing() {
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            maxLength="62"
            minLength="10"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            maxLength="62"
            minLength="10"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <Checkbox id="sale" label="Sell" />
            <Checkbox id="rent" label="Rent" />
            <Checkbox id="parking" label="Parking spot" />
            <Checkbox id="furnished" label="Furnished" />
            <Checkbox id="offer" label="Offer" />
          </div>
          <div className="flex flex-wrap gap-6">
            <NumberInput id="bedroom" label="Beds" />
            <NumberInput id="bathrooms" label="Baths" />
            <NumberInput id="regularPrice" label="Regular Price ($ / month)" />
            <NumberInput
              id="discountPrice"
              label="Discounted Price ($ / month)"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold ">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="image"
              accept="image/*"
              multiple
            />
            <button className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80">
              Upload
            </button>
          </div>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}

// Checkbox component
function Checkbox({ id, label }) {
  return (
    <div className="flex gap-2">
      <input type="checkbox" id={id} className="w-5" />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

// NumberInput component
function NumberInput({ id, label }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        id={id}
        min="1"
        max="10"
        required
        className="p-3 border border-gray-300 rounded-lg"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
