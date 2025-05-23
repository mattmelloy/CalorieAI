import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PhotographyTips() {
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => setIsTipsExpanded(!isTipsExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Tips to improve your photo accuracy
          </h2>
          <p className="text-sm text-gray-500">
            Learn how to take photos that give you the most accurate results
          </p>
        </div>
        {isTipsExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isTipsExpanded && (
        <div className="p-4 bg-gray-50 space-y-4 text-gray-700">
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-900">Lighting is Key</h3>
              <p>Natural light is ideal. If indoors, try to photograph near a window. Avoid using your camera's flash if it creates strong shadows. Well-lit food is easier to analyze.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Show Everything</h3>
              <p>Ensure all parts of your meal are visible. If items are stacked or hidden, try to spread them out slightly so they can be identified.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">One Plate, One Serving</h3>
              <p>Focus on a single portion of food. This helps us accurately estimate the quantities.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Keep it Simple</h3>
              <p>A plain, uncluttered background helps our system focus on the food itself. A solid-colored plate or placemat works well.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">The Right Angle</h3>
              <p>A top-down photo (taken directly above the food) provides the best view for analysis. Avoid angled shots, as they can distort the perceived size of the portions.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Size Matters (Optional)</h3>
              <p>For even better accuracy, you can include a reference object of known size (like a standard fork, spoon, or credit card) next to the food. This helps us understand the scale of the meal. Place the object beside the food, not on top of it.</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">No Filters, Please</h3>
              <p>For the most accurate analysis, please upload photos without any filters applied. Filters can alter colors and make it harder to identify ingredients.</p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">Important Reminder</p>
              <p className="text-blue-600">Please remember that calorie estimations are approximate and intended for informational purposes.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
