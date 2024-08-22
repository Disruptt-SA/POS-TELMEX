<script setup>
import { onMounted, ref } from 'vue';
import { useMenuStore } from '../../stores/menu';

//components

//Variables
const menuStore = useMenuStore();

//methods
</script>

<template>
	<div class="flex bg-[#468aa2] w-full min-h-screen p-4 pt-32 md:pt-24 lg:pt-24">
		<div class="bg-[#ffffff] w-[100%] rounded-3xl shadow-2xl p-2 md:p-10 lg:p-10">
			<div class="flex flex-wrap justify-between">
				<p class="text-4xl md:text-3xl text-[#468aa2] font-semibold text-center">Preferencias de la cuenta</p>
				<div class="col-span-2 w-full md:w-auto">
					<!-- <button
						class="bg-[#fab33c] text-[#ffffff] w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Guardar</button> -->
					<button @click="menuStore.handleMenu()"
						class="bg-[#468aa2] text-white w-full md:w-auto lg:w-auto mt-5 md:mt-0 lg:mt-0 font-semibold px-8 py-2 rounded-xl float-right ml-5 shadow-inp">
						Volver</button>
				</div>
			</div>

			<!-- ACCESO A NETSUITE -->
			<div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#468aa2] rounded-t-lg bg-[#468aa2]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Acceso a Netsuite</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<div class="w-full">
							<div class="flex flex-col -mx-3 mb-6">
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Nombre completo
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Cliente
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- INFORMACION FISCAL -->
			<div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#468aa2] rounded-t-lg bg-[#468aa2]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Información Fiscal</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<div class="w-full">
							<div class="flex flex-col -mx-3 mb-6">
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Nombre de razón social
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										RFC
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Código postal
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Régimen fiscal
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
										<option value="prueba">Prueba</option>
									</select>
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Uso CFDI
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
										<option value="prueba">Prueba</option>
									</select>
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Serie y folio por cada documento
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- INFORMACION DE LA SUCURSAL -->
			<div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#468aa2] rounded-t-lg bg-[#468aa2]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Información de la sucursal</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<div class="w-full">
							<div class="flex flex-col -mx-3 mb-6">
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Moneda base
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
										<option value="prueba">MXN</option>
										<option value="prueba">Dollar</option>
										<option value="prueba">Euro</option>
									</select>
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Subsidiaria
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Location
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Location plan de la demanda
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Cliente plan de la demanda
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Monto faltante o sobrante permitido en caja
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- APARIENCIA -->
			<!-- <div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#468aa2] rounded-t-lg bg-[#468aa2]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Apariencia</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<div class="w-full">
							<div class="flex flex-col -mx-3 mb-6">
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Nombre de la sucursal
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Logotipo
									</label>
									<input
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
										id="grid-last-name" type="text">
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Idioma
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
										<option value="prueba">Español</option>
										<option value="prueba">Ingles</option>
										<option value="prueba">Aleman</option>
									</select>
								</div>
								<div class="w-full md:w-1/3 px-3 mt-2">
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
										for="grid-last-name">
										Paleta de colores
									</label>
									<select
										class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
										<option value="prueba">Amarrillo - Azul</option>
										<option value="prueba">Verde - Rojo</option>
										<option value="prueba">Cafe - Amarillo</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div> -->

			<!-- SINCRONIZACION NETSUITE -->
			<!-- <div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#468aa2] rounded-t-lg bg-[#468aa2]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Sincronización Netsuite - POS</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<p class="text-xl font-semibold text-[#468aa2]">POS solicita información a Netsuite - (GET Netsuite)
						</p>
						<div class="bg-white rounded-lg" id="about" role="tabpanel" aria-labelledby="about-tab">
							<div class="flex flex-col overflow-x-auto">
								<div class="sm:-mx-6 lg:-mx-8">
									<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
										<div class="overflow-x-auto">
											<table class="min-w-full text-left text-sm font-light">
												<thead class="border-b font-medium text-center bg-slate-200">
													<tr>
														<th scope="col" class="px-5 py-4">Acción</th>
														<th scope="col" class="px-5 py-4">Registro</th>
														<th scope="col" class="px-5 py-4">Seleccionar Frecuencia</th>
														<th scope="col" class="px-5 py-4">Ultima Sincronización</th>
													</tr>
												</thead>
												<tbody>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">ARTICULOS</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba">1 Hora</option>
																<option value="prueba">8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">29/09/2023 10:20:05</td>
													</tr>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Promociones
														</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba" selected>30 Min</option>
																<option value="prueba">1 Hora</option>
																<option value="prueba">8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">29/09/2023 10:20:05</td>
													</tr>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Empleados</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba" selected>1 Hora</option>
																<option value="prueba">8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">Error en direcciones</td>
													</tr>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Clientes</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba">1 Hora</option>
																<option value="prueba" selected>8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">Error en direcciones</td>
													</tr>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Transacciones
														</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba">1 Hora</option>
																<option value="prueba" selected>8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">Error en direcciones</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>

						<p class="text-xl font-semibold text-[#468aa2] mt-10">POS envia información a Netsuite - (POST
							Netsuite)
						</p>
						<div class="bg-white rounded-lg" id="about" role="tabpanel" aria-labelledby="about-tab">
							<div class="flex flex-col overflow-x-auto">
								<div class="sm:-mx-6 lg:-mx-8">
									<div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
										<div class="overflow-x-auto">
											<table class="min-w-full text-left text-sm font-light">
												<thead class="border-b font-medium text-center bg-slate-200">
													<tr>
														<th scope="col" class="px-5 py-4">Acción</th>
														<th scope="col" class="px-5 py-4">Registro</th>
														<th scope="col" class="px-5 py-4">Seleccionar Frecuencia</th>
														<th scope="col" class="px-5 py-4">Ultima Sincronización</th>
													</tr>
												</thead>
												<tbody>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Clientes</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba" selected>1 Hora</option>
																<option value="prueba">8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">29/09/2023 10:20:05</td>
													</tr>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Articulos
														</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba" selected>1 Hora</option>
																<option value="prueba">8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">29/09/2023 10:20:05</td>
													</tr>
													<tr class="border-b text-center items-center">
														<td class="whitespace-nowrap px-2 py-4">
															<button @click="menuStore.handleClient('listClients')"
																class="bg-[#468aa2] w-full md:w-auto text-white mb-3 font-semibold px-8 py-2 rounded-xl shadow-inp">
																Sincronizar</button>
														</td>
														<td class="whitespace-nowrap px-2 py-4 font-semibold">Transacciones
														</td>
														<td class="whitespace-nowrap px-2 py-4">
															<select
																class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
																<option value="prueba">15 Min</option>
																<option value="prueba">30 Min</option>
																<option value="prueba">1 Hora</option>
																<option value="prueba" Selected>8 Horas</option>
															</select>
														</td>
														<td class="whitespace-nowrap px-2 py-4">29/09/2023 10:20:05</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div> -->

			<!-- Información de versión -->
			<div class="w-full mt-5 bg-white border border-gray-200 rounded-lg shadow">
				<ul class="flex flex-wrap text-sm font-medium text-center text-white border-b border-[#468aa2] rounded-t-lg bg-[#468aa2]"
					id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
					<li class="me-2">
						<p class="inline-block p-4">Información de la aplicación</p>
					</li>
				</ul>
				<div id="defaultTabContent">
					<div class="p-4 bg-white rounded-lg md:p-8" id="about" role="tabpanel" aria-labelledby="about-tab">
						<div class="w-full">
							<div class="flex flex-col -mx-3 mb-6">
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-6">
									<label class="block uppercase tracking-wide text-gray-700 text-lg font-bold"
										for="grid-last-name">
										Versión de compilación
									</label>
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold"
										for="grid-last-name">
										V.Beta 1.0.0.240814
									</label>
								</div>
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-6">
									<label class="block uppercase tracking-wide text-gray-700 text-lg font-bold"
										for="grid-last-name">
										Author
									</label>
									<label class="block uppercase tracking-wide text-gray-700 text-xs font-bold"
										for="grid-last-name">
										DisrupTT S.A. de C.V.
									</label>
								</div>
								<div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
									<label class="block uppercase tracking-wide text-gray-700 text-lg font-bold"
										for="grid-last-name">
										Powered by
									</label>
									<img src="../../assets/img/logo/logodtt.png" class="h-8" alt="DisrupTT Logo" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.shadow-inp {
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.shadow-sl {
	box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
}
</style>