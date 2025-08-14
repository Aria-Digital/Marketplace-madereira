document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('product-form');
    const nameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('product-price');
    const imageInput = document.getElementById('product-image');
    const descriptionInput = document.getElementById('product-description');
    const productsList = document.getElementById('product-list');
    const imagePreviewContainer = document.getElementById('image-preview');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    let products = JSON.parse(localStorage.getItem('products')) || [];
    let editingProductIndex = null;

    // Função para formatar o valor como moeda brasileira (Real)
const formatCurrency = (value) => {
    // Garante que o valor é um número válido, senão usa 0
    const numericValue = parseFloat(value) || 0;
    
    // Converte o número para uma string com 2 casas decimais antes de formatar
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numericValue);
};

    const renderProducts = () => {
        productsList.innerHTML = '';
        products.forEach((product, index) => {
            const li = document.createElement('li');
            li.classList.add('product-item');
            li.innerHTML = `
                <div class="product-info">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div>${product.name}</div>
                    <p class="product-description-admin">${product.description}</p>
                    <p>${formatCurrency(product.price)}</p>
                </div>
                <div class="product-actions">
                    <button class="btn-edit" data-index="${index}">Editar</button>
                    <button class="btn-delete" data-index="${index}">Remover</button>
                </div>
            `;
            productsList.appendChild(li);
        });
    };

    const previewImage = (input) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização da imagem" class="preview-image">`;
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            imagePreviewContainer.innerHTML = '';
        }
    };

    const clearForm = () => {
        nameInput.value = '';
        priceInput.value = '';
        imageInput.value = '';
        descriptionInput.value = '';
        imagePreviewContainer.innerHTML = '';
        submitBtn.textContent = 'Adicionar Produto';
        cancelBtn.style.display = 'none';
        editingProductIndex = null;
    };

    imageInput.addEventListener('change', (event) => {
        previewImage(event.target);
    });

    form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const name = nameInput.value;
    const description = descriptionInput.value;
    const imageFile = imageInput.files[0];
    
    // NOVO CÓDIGO CORRIGIDO: Limpa o input de preço de forma inteligente
    let cleanPriceString = priceInput.value.replace(/[R$ ]/g, '');
    
    // Se a string contém vírgula, assume-se que é o separador decimal brasileiro
    if (cleanPriceString.includes(',')) {
        cleanPriceString = cleanPriceString.replace(/\./g, ''); // Remove pontos de milhar
        cleanPriceString = cleanPriceString.replace(',', '.');  // Substitui a vírgula por ponto
    }
    // Se não houver vírgula, o ponto é tratado como separador decimal (formato americano)
    
    const price = parseFloat(cleanPriceString);

    // Linhas de depuração (opcional, pode ser removido depois)
    console.log('Valor do input original:', priceInput.value);
    console.log('Valor limpo:', cleanPriceString);
    console.log('Valor numérico salvo:', price);


    if (!name || isNaN(price) || price <= 0 || !description || (!imageFile && editingProductIndex === null)) {
        alert("Por favor, preencha todos os campos e selecione uma imagem.");
        return;
    }
    
    if (editingProductIndex !== null) {
        products[editingProductIndex].name = name;
        products[editingProductIndex].price = price;
        products[editingProductIndex].description = description;

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                products[editingProductIndex].image = e.target.result;
                localStorage.setItem('products', JSON.stringify(products));
                renderProducts();
                clearForm();
            };
            reader.readAsDataURL(imageFile);
        } else {
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts();
            clearForm();
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            name: name,
            price: price,
            description: description,
            image: e.target.result
        };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
        clearForm();
    };
    reader.readAsDataURL(imageFile);
});

    productsList.addEventListener('click', (event) => {
        const target = event.target;
        const index = target.dataset.index;

        if (target.classList.contains('btn-delete')) {
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts();
        } else if (target.classList.contains('btn-edit')) {
            const productToEdit = products[index];
            nameInput.value = productToEdit.name;
            priceInput.value = productToEdit.price;
            descriptionInput.value = productToEdit.description;
            imagePreviewContainer.innerHTML = `<img src="${productToEdit.image}" alt="${productToEdit.name}" class="preview-image">`;
            submitBtn.textContent = 'Salvar Alterações';
            cancelBtn.style.display = 'inline-block';
            editingProductIndex = index;
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    cancelBtn.addEventListener('click', () => {
        clearForm();
    });

    renderProducts();
});