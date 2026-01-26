// Dutch grade calculation methods
const dutchMethods = {
    dutch_1_10: {
        name: "Dutch 1-10 Scale",
        description: "Standard Dutch grading scale from 1.0 to 10.0. 5.5 is the minimum passing grade.",
        calculate: (points, maxPoints) => {
            if (maxPoints === 0) return { grade: 0, description: "Invalid: Maximum points cannot be zero" };
            const percentage = (points / maxPoints) * 100;
            let grade;
            
            if (percentage >= 95) grade = 10;
            else if (percentage >= 90) grade = 9;
            else if (percentage >= 85) grade = 8;
            else if (percentage >= 80) grade = 7.5;
            else if (percentage >= 75) grade = 7;
            else if (percentage >= 70) grade = 6.5;
            else if (percentage >= 65) grade = 6;
            else if (percentage >= 60) grade = 5.5;
            else if (percentage >= 55) grade = 5;
            else if (percentage >= 50) grade = 4.5;
            else if (percentage >= 45) grade = 4;
            else if (percentage >= 40) grade = 3.5;
            else if (percentage >= 35) grade = 3;
            else if (percentage >= 30) grade = 2.5;
            else if (percentage >= 25) grade = 2;
            else if (percentage >= 20) grade = 1.5;
            else grade = 1;
            
            const passed = grade >= 5.5;
            const description = passed ? "Passed" : "Failed";
            
            return { grade: grade.toFixed(1), description, passed };
        }
    },
    
    dutch_percentage: {
        name: "Dutch Percentage Scale",
        description: "Direct percentage to grade conversion: (percentage / 10) + 1, rounded to nearest 0.5.",
        calculate: (points, maxPoints) => {
            if (maxPoints === 0) return { grade: 0, description: "Invalid: Maximum points cannot be zero" };
            const percentage = (points / maxPoints) * 100;
            let grade = (percentage / 10) + 1;
            
            // Round to nearest 0.5
            grade = Math.round(grade * 2) / 2;
            
            // Clamp between 1 and 10
            grade = Math.max(1, Math.min(10, grade));
            
            const passed = grade >= 5.5;
            const description = passed ? "Passed" : "Failed";
            
            return { grade: grade.toFixed(1), description, passed };
        }
    },
    
    dutch_cevo: {
        name: "Dutch CEVO Scale",
        description: "Central Examination Scale: 0-100 points converted to 1-10 scale with specific thresholds.",
        calculate: (points, maxPoints) => {
            if (maxPoints === 0) return { grade: 0, description: "Invalid: Maximum points cannot be zero" };
            const percentage = (points / maxPoints) * 100;
            let grade;
            
            if (percentage >= 90) grade = 10;
            else if (percentage >= 85) grade = 9;
            else if (percentage >= 80) grade = 8;
            else if (percentage >= 75) grade = 7;
            else if (percentage >= 70) grade = 6;
            else if (percentage >= 60) grade = 5.5;
            else if (percentage >= 50) grade = 5;
            else if (percentage >= 40) grade = 4;
            else if (percentage >= 30) grade = 3;
            else if (percentage >= 20) grade = 2;
            else grade = 1;
            
            const passed = grade >= 5.5;
            const description = passed ? "Passed" : "Failed";
            
            return { grade: grade.toFixed(1), description, passed };
        }
    }
};

// Custom methods storage
let customMethods = JSON.parse(localStorage.getItem('customMethods')) || {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateMethodSelect();
    updateMethodInfo();
    updateSavedMethods();
    
    // Add event listeners
    document.getElementById('methodSelect').addEventListener('change', updateMethodInfo);
    document.getElementById('scaleType').addEventListener('change', toggleScaleOptions);
    
    // Add initial threshold
    addThreshold();
});

function calculateGrade() {
    const pointsObtained = parseFloat(document.getElementById('pointsObtained').value);
    const maxPoints = parseFloat(document.getElementById('maxPoints').value);
    const method = document.getElementById('methodSelect').value;
    
    if (isNaN(pointsObtained) || isNaN(maxPoints)) {
        showResult('Error', 'Please enter valid numbers for points', false);
        return;
    }
    
    if (maxPoints <= 0) {
        showResult('Error', 'Maximum points must be greater than zero', false);
        return;
    }
    
    if (pointsObtained < 0) {
        showResult('Error', 'Points obtained cannot be negative', false);
        return;
    }
    
    if (pointsObtained > maxPoints) {
        showResult('Error', 'hey uhm you cant do that if ur tired i understand but focus you dont want wrong grades do you now?', false);
        return;
    }
    
    let result;
    
    if (method === 'custom') {
        // Use the first available custom method
        const customMethodKeys = Object.keys(customMethods);
        if (customMethodKeys.length === 0) {
            showResult('Error', 'No custom methods available. Please create one first.', false);
            return;
        }
        
        const customMethod = customMethods[customMethodKeys[0]];
        result = calculateCustomGrade(pointsObtained, maxPoints, customMethod);
    } else {
        result = dutchMethods[method].calculate(pointsObtained, maxPoints);
    }
    
    showResult(result.grade, result.description, result.passed);
}

function calculateCustomGrade(points, maxPoints, method) {
    if (maxPoints === 0) return { grade: 0, description: "Invalid: Maximum points cannot be zero" };
    
    const percentage = (points / maxPoints) * 100;
    let grade;
    
    if (method.type === 'linear') {
        const range = method.maxGrade - method.minGrade;
        grade = method.minGrade + (percentage / 100) * range;
        grade = Math.max(method.minGrade, Math.min(method.maxGrade, grade));
        grade = Math.round(grade * 10) / 10; // Round to 1 decimal place
    } else if (method.type === 'thresholds') {
        grade = method.minGrade;
        for (const threshold of method.thresholds) {
            if (percentage >= threshold.percentage) {
                grade = threshold.grade;
            } else {
                break;
            }
        }
    }
    
    const passed = grade >= method.passingGrade;
    const description = passed ? "Passed" : "Failed";
    
    return { grade: grade.toFixed(1), description, passed };
}

function showResult(grade, description, passed) {
    const resultDiv = document.getElementById('result');
    const gradeResult = document.getElementById('gradeResult');
    const gradeDescription = document.getElementById('gradeDescription');
    
    resultDiv.classList.remove('hidden');
    gradeResult.textContent = grade;
    gradeDescription.textContent = description;
    
    // Update styling based on pass/fail
    if (passed === true) {
        gradeResult.className = 'text-3xl font-bold text-green-600';
    } else if (passed === false) {
        gradeResult.className = 'text-3xl font-bold text-red-600';
    } else {
        gradeResult.className = 'text-3xl font-bold text-indigo-600';
    }
}

function updateMethodInfo() {
    const method = document.getElementById('methodSelect').value;
    const methodInfo = document.getElementById('methodInfo');
    
    if (method === 'custom') {
        methodInfo.innerHTML = '<p>Select a custom method from the dropdown or create a new one using the Custom Method Creator.</p>';
    } else {
        const methodData = dutchMethods[method];
        methodInfo.innerHTML = `
            <h3 class="font-semibold text-lg mb-2">${methodData.name}</h3>
            <p>${methodData.description}</p>
        `;
    }
}

function toggleScaleOptions() {
    const scaleType = document.getElementById('scaleType').value;
    const linearOptions = document.getElementById('linearOptions');
    const thresholdOptions = document.getElementById('thresholdOptions');
    
    if (scaleType === 'linear') {
        linearOptions.classList.remove('hidden');
        thresholdOptions.classList.add('hidden');
    } else {
        linearOptions.classList.add('hidden');
        thresholdOptions.classList.remove('hidden');
    }
}

function addThreshold() {
    const thresholdList = document.getElementById('thresholdList');
    const thresholdDiv = document.createElement('div');
    thresholdDiv.className = 'flex gap-2 items-center';
    thresholdDiv.innerHTML = `
        <input type="number" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Min %" step="0.1">
        <input type="number" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Grade" step="0.1">
        <button onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">
            <i class="fas fa-trash"></i>
        </button>
    `;
    thresholdList.appendChild(thresholdDiv);
}

function saveCustomMethod() {
    const name = document.getElementById('methodName').value.trim();
    const scaleType = document.getElementById('scaleType').value;
    
    if (!name) {
        alert('Please enter a method name');
        return;
    }
    
    let method;
    
    if (scaleType === 'linear') {
        const minGrade = parseFloat(document.getElementById('minGrade').value);
        const maxGrade = parseFloat(document.getElementById('maxGrade').value);
        const passingGrade = parseFloat(document.getElementById('passingGrade').value);
        
        if (isNaN(minGrade) || isNaN(maxGrade) || isNaN(passingGrade)) {
            alert('Please enter valid numbers for all fields');
            return;
        }
        
        if (minGrade >= maxGrade) {
            alert('Min grade must be less than max grade');
            return;
        }
        
        method = {
            type: 'linear',
            minGrade,
            maxGrade,
            passingGrade
        };
    } else {
        const thresholdInputs = document.querySelectorAll('#thresholdList > div');
        const thresholds = [];
        
        for (const thresholdDiv of thresholdInputs) {
            const inputs = thresholdDiv.querySelectorAll('input');
            const percentage = parseFloat(inputs[0].value);
            const grade = parseFloat(inputs[1].value);
            
            if (!isNaN(percentage) && !isNaN(grade)) {
                thresholds.push({ percentage, grade });
            }
        }
        
        if (thresholds.length === 0) {
            alert('Please add at least one threshold');
            return;
        }
        
        // Sort thresholds by percentage (descending)
        thresholds.sort((a, b) => b.percentage - a.percentage);
        
        const passingGrade = parseFloat(document.getElementById('passingGrade').value);
        
        method = {
            type: 'thresholds',
            minGrade: Math.min(...thresholds.map(t => t.grade)),
            maxGrade: Math.max(...thresholds.map(t => t.grade)),
            passingGrade,
            thresholds
        };
    }
    
    customMethods[name] = method;
    localStorage.setItem('customMethods', JSON.stringify(customMethods));
    
    updateMethodSelect();
    updateSavedMethods();
    
    // Clear form
    document.getElementById('methodName').value = '';
    
    alert(`Custom method "${name}" saved successfully!`);
}

function updateMethodSelect() {
    const methodSelect = document.getElementById('methodSelect');
    const currentValue = methodSelect.value;
    
    // Clear existing custom options
    const customOptions = methodSelect.querySelectorAll('option[value^="custom_"]');
    customOptions.forEach(option => option.remove());
    
    // Add custom methods
    for (const [name, method] of Object.entries(customMethods)) {
        const option = document.createElement('option');
        option.value = `custom_${name}`;
        option.textContent = name;
        methodSelect.appendChild(option);
    }
    
    // Restore selection if possible
    if (currentValue && methodSelect.querySelector(`option[value="${currentValue}"]`)) {
        methodSelect.value = currentValue;
    }
}

function updateSavedMethods() {
    const savedMethodsDiv = document.getElementById('savedMethods');
    
    if (Object.keys(customMethods).length === 0) {
        savedMethodsDiv.innerHTML = '<p class="text-gray-500 italic">No custom methods saved yet.</p>';
        return;
    }
    
    savedMethodsDiv.innerHTML = '';
    
    for (const [name, method] of Object.entries(customMethods)) {
        const methodDiv = document.createElement('div');
        methodDiv.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
        
        let description = '';
        if (method.type === 'linear') {
            description = `${method.minGrade}-${method.maxGrade} scale, pass: ${method.passingGrade}`;
        } else {
            description = `${method.thresholds.length} thresholds, pass: ${method.passingGrade}`;
        }
        
        methodDiv.innerHTML = `
            <div>
                <div class="font-medium">${name}</div>
                <div class="text-sm text-gray-600">${description}</div>
            </div>
            <button onclick="deleteCustomMethod('${name}')" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        savedMethodsDiv.appendChild(methodDiv);
    }
}

function deleteCustomMethod(name) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
        delete customMethods[name];
        localStorage.setItem('customMethods', JSON.stringify(customMethods));
        updateMethodSelect();
        updateSavedMethods();
    }
}
